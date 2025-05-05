// src/context/AuthContext.tsx
import React, {
    createContext, useState, useContext, useEffect, useCallback, ReactNode, useMemo
} from 'react';
import { useQueryClient } from '@tanstack/react-query'; // Import queryClient hook
import { useCurrentUser } from '../hooks/useAuth'; // Use the query hook
import type { User } from '@server/types/auth-types'; // Use backend types

// Define the shape of the context value
export interface AuthContextType {
    isAuthenticated: boolean;   // Is there a valid token AND verified user data?
    user: User | null;          // Logged-in user data
    token: string | null;       // The JWT token itself
    isLoading: boolean;         // True while initially checking auth status on app load
    login: (token: string, userData: User) => void; // Action to set state after successful login
    logout: () => void;         // Action to clear auth state and token
    checkAuthStatus: () => Promise<void>; // Action to manually re-verify token
}

// Create the context
const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * AuthProvider Component: Manages global authentication state.
 */
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const queryClient = useQueryClient();

    // --- State ---
    // Token state, initialized from localStorage (null if error or not found)
    const [token, setToken] = useState<string | null>(() => {
        try { return localStorage.getItem('authToken'); } catch (e) { console.error("AuthContext: Failed to read authToken from localStorage", e); return null; }
    });
    // User state, initialized as null
    const [user, setUser] = useState<User | null>(null);

    // --- Auth Check Query ---
    // Fetches user data if a token exists. Handles token validation implicitly.
    const {
        data: currentUserData,
        isLoading: isCheckingAuth, // Use this name consistently
        isError: isCheckAuthError,
        isSuccess: isCheckAuthSuccess,
        isFetched: isCheckAuthFetched,
        refetch: refetchCurrentUser,
    } = useCurrentUser({
        enabled: !!token, // Only run query if `token` state is not null
        retry: (failureCount, error: any) => { // Prevent retries on auth errors
            if (error?.response?.status === 401 || error?.response?.status === 403) return false;
            return failureCount < 1;
        },
    });

    // --- Derived State ---
    // isLoading is true ONLY during the very first check when the app loads with a token
    const isLoading = !!token && !isCheckAuthFetched;
    // isAuthenticated is true only if we have BOTH a token in state AND user data in state
    const isAuthenticated = !!token && !!user; // Simplified: rely on useEffect to clear user if token/query fails

    // --- Actions (Memoized with useCallback) ---

    const logout = useCallback(() => {
        console.log("AuthContext Action: logout executing...");
        const tokenExisted = !!localStorage.getItem('authToken');
        try { localStorage.removeItem('authToken'); } catch (e) { console.error("AuthContext: Failed removing token", e); }
        setToken(null);
        setUser(null);
        queryClient.resetQueries({ queryKey: ['currentUser'], exact: true });
        queryClient.removeQueries({ queryKey: ['currentUser'], exact: true });
        console.log(`AuthContext: Logout complete. ${ tokenExisted ? "(Token removed)" : "(No token found)" }`);
    }, [queryClient]);

    const login = useCallback((newToken: string, userData: User) => {
        console.log("AuthContext Action: login executing for", userData.name);
        try { localStorage.setItem('authToken', newToken); } catch (e) { console.error("AuthContext: Failed writing token", e); }
        setUser(userData); // Set user first
        setToken(newToken); // Set token last (triggers effects/query if not already enabled)
        queryClient.setQueryData(["currentUser"], userData); // Prime the cache
    }, [queryClient]);

    const checkAuthStatus = useCallback(async () => {
        console.log("AuthContext Action: checkAuthStatus executing...");
        const currentTokenInStorage = localStorage.getItem('authToken');
        if (currentTokenInStorage) {
            if (token !== currentTokenInStorage) setToken(currentTokenInStorage); // Sync state if needed
            try {
                await refetchCurrentUser(); // Re-run the GET /me query
            } catch (error: any) {
                console.error("AuthContext: Manual token check failed:", error.message);
                logout(); // Logout if the check fails
            }
        } else {
            console.log("AuthContext: No token in storage during manual check.");
            if (token || user) logout(); // Ensure logout state if no token found
        }
    }, [refetchCurrentUser, logout, token, user]); // Added user to dependencies

    // --- Side Effects ---

    // Effect 1: Synchronize `user` state with `useCurrentUser` query results
    useEffect(() => {
        if (token && isCheckAuthFetched) { // Only act if we have a token and query has run
            if (isCheckAuthSuccess && currentUserData) {
                // Query succeeded: Update user state only if it's different
                if (user?.id !== currentUserData.id) {
                    console.log("AuthContext Effect [Query Sync]: Setting user state from fetched data:", currentUserData.name);
                    setUser(currentUserData);
                }
            } else if (isCheckAuthError && !isCheckingAuth) {
                // Query failed (and not currently retrying): Assume token is invalid/expired
                console.warn("AuthContext Effect [Query Sync]: Auth check query failed. Logging out.");
                logout();
            }
        } else if (!token && user !== null) {
            // If token was removed (e.g., by logout), ensure user state is also cleared
            console.log("AuthContext Effect [Query Sync]: Token is null, clearing user state.");
            setUser(null);
        }
        // Dependencies: Run when these values change
    }, [
        token,
        currentUserData,
        isCheckingAuth, // Use consistent name
        isCheckAuthSuccess,
        isCheckAuthError,
        isCheckAuthFetched,
        user, // Include user state
        logout // Include logout action (FIXED: Added missing dependency)
    ]);

    // Effect 2: Listen for global 'auth-unauthorized' events (from API interceptor)
    useEffect(() => {
        const handleUnauthorized = (event: Event) => {
            console.warn("AuthContext: Received 'auth-unauthorized' event. Logging out.");
            // Optionally inspect event.detail if the interceptor sends data:
            // const { error } = (event as CustomEvent).detail;
            logout(); // Trigger logout immediately
        };

        console.log("AuthContext: Adding 'auth-unauthorized' event listener.");
        window.addEventListener('auth-unauthorized', handleUnauthorized);

        // Cleanup: Remove listener when AuthProvider unmounts
        return () => {
            console.log("AuthContext: Removing 'auth-unauthorized' event listener.");
            window.removeEventListener('auth-unauthorized', handleUnauthorized);
        };
    }, [logout]); // Dependency: logout action

    // --- Provide Context Value ---
    // Memoize to prevent unnecessary re-renders for consumers
    const contextValue = useMemo(() => ({
        isAuthenticated,
        user,
        token,
        isLoading,
        login,
        logout,
        checkAuthStatus
        // Dependencies for memoization
    }), [isAuthenticated, user, token, isLoading, login, logout, checkAuthStatus]);

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

// --- Custom Hook to Use Auth Context ---
export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};