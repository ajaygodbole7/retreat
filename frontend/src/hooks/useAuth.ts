// src/hooks/useAuth.ts
import { useQuery, useMutation, useQueryClient, type UseQueryOptions } from "@tanstack/react-query";
import { authApi } from "../lib/api"; // Use our API client definitions
import { useToast } from "./use-toast";
import type { LoginInput, RegisterInput, User, AuthResponse } from '@server/types/auth-types'; // Use backend types
import { useEffect } from "react";

// --- Enhanced Options Type (THIS IS THE KEY FIX) ---
// Allow all React Query options, not just { enabled?: boolean }
interface UseCurrentUserOptions extends Omit<UseQueryOptions<User, Error>, 'queryKey' | 'queryFn'> {
    enabled?: boolean;
}

// --- Query Hook ---

/**
 * Hook to fetch the current user's data.
 * Relies on the Axios interceptor to send the token automatically.
 * The query key 'currentUser' allows easy invalidation/refetching.
 * @param options - Optional configuration for the query (e.g., enabled).
 */
export function useCurrentUser(options: UseCurrentUserOptions = {}) {
    const queryInfo = useQuery<User, Error>({
        queryKey: ["currentUser"], // Unique identifier for this data in the cache
        queryFn: authApi.getCurrentUser, // The function that performs the API call
        retry: 1, // Attempt to refetch once on failure
        staleTime: 1000 * 60 * 5, // Data is considered fresh for 5 minutes
        refetchOnWindowFocus: true, // Refetch when the browser window gains focus
        enabled: options?.enabled ?? true, // Control whether the query runs automatically
        // If this query fails (e.g., 401 Unauthorized), `error` will be populated,
        // and `data` will likely be undefined. The AuthContext uses this.
        // ADD this line to spread all passed options
        ...options,
    });

    // Add specific log for status changes
    useEffect(() => {
        console.log("useCurrentUser Status:", queryInfo.status, "Is Loading:", queryInfo.isLoading, "Error:", queryInfo.error?.message);
    }, [queryInfo.status, queryInfo.isLoading, queryInfo.error]);


    return queryInfo;
}


// --- Mutation Hooks ---

/**
 * Hook for handling the user login process.
 * Provides mutate function, loading state, and error state.
 * Integrates with react-query cache and toast notifications.
 * @returns TanStack Query useMutation result for login.
 */
export function useLogin() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation<AuthResponse, Error, LoginInput>({
        mutationFn: authApi.login, // Function that performs the API call
        // --- onSuccess Callback ---
        // Executed when the login API call succeeds.
        onSuccess: (data) => {
            // `data` here is the AuthResponse { token, user } from the backend.
            console.log("useLogin onSuccess: User logged in -", data.user.name);

            // 1. Update 'currentUser' query cache:
            //    Immediately update the cached user data so components using
            //    useCurrentUser instantly reflect the logged-in state without needing a refetch.
            queryClient.setQueryData(["currentUser"], data.user);

            // 2. Invalidate other queries? (Optional)
            //    If other data depends on the logged-in user, invalidate those queries
            //    so they refetch with the new authentication context.
            //    queryClient.invalidateQueries({ queryKey: ['userSpecificData'] });

            // 3. Show Success Toast (Handled in component for better context)
            // toast({ title: "Success", description: "Login successful!" });

            // NOTE: Storing the token and updating global state (isAuthenticated)
            // is handled by the AuthContext's `login` function, which should be
            // called from the component *after* this onSuccess handler.
        },
        // --- onError Callback ---
        // Executed when the login API call fails.
        onError: (error: Error) => {
            console.error("useLogin onError:", error.message);
            // Error toast is handled in the component where the mutation is called,
            // as it can provide more specific user feedback.
        },
    });
}

/**
 * Hook for handling the user registration process.
 * @returns TanStack Query useMutation result for registration.
 */
export function useRegister() {
    const { toast } = useToast(); // Use toast for feedback

    return useMutation<{ message: string; user: User }, Error, RegisterInput>({
        mutationFn: authApi.register,
        onSuccess: (data) => {
            console.log("useRegister onSuccess: User registered -", data.user.name);
            // Success toast handled in the component.
        },
        onError: (error: Error) => {
            console.error("useRegister onError:", error.message);
            // Error toast handled in the component.
        },
    });
}

// Future: Add hooks for password reset, email verification, etc.
// export function useForgotPassword() { ... }
// export function useResetPassword() { ... }