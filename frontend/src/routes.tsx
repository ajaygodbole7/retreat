import { Router, Route, RootRoute } from "@tanstack/react-router";
import { DashboardPage } from "./pages/dashboard";
import { IngredientsDashboardPage } from "./pages/ingredients-dashboard";

// Define the root route
const rootRoute = new RootRoute();

// Define the routes
const indexRoute = new Route({
    getParentRoute: () => rootRoute,
    path: "/",
    component: DashboardPage,
});

const ingredientsRoute = new Route({
    getParentRoute: () => rootRoute,
    path: "/ingredients",
    component: IngredientsDashboardPage,
});

// Create the route tree
const routeTree = rootRoute.addChildren([
    indexRoute,
    ingredientsRoute,
]);

// Create the router
const router = new Router({ routeTree });

// Register the router for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

export default router;