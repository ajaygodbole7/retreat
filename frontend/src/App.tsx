// src/App.tsx
import { RouterProvider } from "@tanstack/react-router";
import { useEffect } from "react";
import { router } from "./routeTree";         // Import the configured TanStack Router instance
import { useAuth } from "./contexts/auth-context"; // Import the useAuth hook to access context
import { Toaster } from "@/components/ui/sonner";  // Import Sonner Toaster for notifications
import "./App.css";                          // Optional: App-specific styles
import { isAxiosError } from "axios"; // Import axios type guard
import axios from 'axios';


/**
 * The main application component.
 * Sets up providers (QueryClient, Router) and global error handling.
 */
function App() {
  // Access the authentication context. This hook *must* be called within
  // a component descendant of AuthProvider (which is set up in main.tsx).
  const auth = useAuth();

  // --- Optional: Global Error Handling ---
  // Sets up listeners to catch errors that are not caught by local try/catch blocks.
  useEffect(() => {
    const handleGlobalError = (event: ErrorEvent | PromiseRejectionEvent) => {
      const error = 'error' in event ? event.error : event.reason;
      console.error("Unhandled Global Error Detected:", error);
      // Basic check to avoid logging generic Axios cancellation errors excessively
      if (isAxiosError(error) && axios.isCancel(error)) {
        console.warn("Global Handler: Axios request cancelled.");
        return;
      }
      // TODO: Integrate with an error reporting service like Sentry in production.
      // Example: Sentry.captureException(error);
    };

    // Listen for standard synchronous errors
    window.addEventListener("error", handleGlobalError);
    // Listen for unhandled promise rejections (async errors)
    window.addEventListener("unhandledrejection", handleGlobalError);

    // Cleanup function: Remove the listeners when the App component unmounts.
    return () => {
      window.removeEventListener("error", handleGlobalError);
      window.removeEventListener("unhandledrejection", handleGlobalError);
    };
  }, []); // Empty dependency array ensures this effect runs only once on mount.

  // Render the application structure
  return (
    <>
      {/* Provide the TanStack Router instance and the *auth context* */}
      {/* The router needs the context for its `beforeLoad` guards. */}
      <RouterProvider router={router} context={{ auth }} />

      {/* Render the Sonner Toaster component for notifications */}
      <Toaster richColors position="top-right" />
    </>
  );
}

export default App;