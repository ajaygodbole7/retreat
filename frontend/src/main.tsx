// src/main.tsx
import React, { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"; // Import QueryClient
import './index.css';
import App from './App.tsx';
import { AuthProvider } from './contexts/auth-context'; // Import AuthProvider

// --- Create the React Query client instance ---
// Create this instance *once* here at the root of your application.
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // Default query options applied globally
      retry: 1, // Retry failed requests once
      staleTime: 1000 * 60 * 5, // 5 minutes: Data is considered fresh
      refetchOnWindowFocus: true, // Refetch when window gains focus (good for auth status)
      gcTime: 1000 * 60 * 15, // 15 minutes: Cache garbage collection time
    },
  },
});
// --- End Query Client Creation ---

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Fatal Error: Root element with ID 'root' not found in the HTML.");
}

const root = createRoot(rootElement);

// Render the application with the CORRECT provider order
root.render(
  <StrictMode>
    {/* 1. QueryClientProvider MUST be the outer provider */}
    {/* It provides the queryClient instance to all descendants */}
    <QueryClientProvider client={queryClient}>
      {/* 2. AuthProvider goes inside QueryClientProvider */}
      {/* It needs access to the queryClient (via hooks) */}
      <AuthProvider>
        {/* 3. App (which contains RouterProvider) goes inside AuthProvider */}
        {/* It needs access to both queryClient and authContext */}
        <App />
      </AuthProvider>
    </QueryClientProvider>
  </StrictMode>,
);