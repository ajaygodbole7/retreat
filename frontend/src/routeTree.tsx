// frontend/src/routeTree.tsx
import { createRootRoute, createRoute, createRouter } from "@tanstack/react-router"
import { RootLayout } from "./components/layouts/RootLayout"
import { IngredientsPage } from "./features/ingredients/IngredientsPage"
import { IngredientForm } from "./features/ingredients/IngredientForm"
import { IngredientDetail } from "./features/ingredients/IngredientDetail"
import { RecipesPage } from "./features/recipes/RecipesPage"
import { RecipeDetail } from "./features/recipes/RecipeDetail"
import { RecipeForm } from "./features/recipes/RecipeFormGemini"
//import { RecipeForm } from "./features/recipes/RecipeForm"
//import { IntegratedRecipeForm } from "./features/recipes/IntegratedRecipeForm"
//import { CompleteRecipeForm } from "./features/recipes/CompleteRecipeForm"
// Event Imports
import { EventsPage } from "./features/events/EventsPage";
import { EventForm } from "./features/events/EventForm";
import { EventDetail } from "./features/events/EventDetail";
import ComingSoon from "./pages/ComingSoon"
import NotFound from "./pages/NotFound"
import UnderConstruction from "./pages/UnderConstruction"
import Dashboard from "./pages/DashboardNew"

// --- Type Helper for Loader Context ---
interface EditContext { mode: 'edit'; id: number }
interface NewContext { mode: 'new' }

// Define specific context types for clarity
type EventFormRouteContext = EditContext | NewContext;

// Create the root route
export const rootRoute = createRootRoute({
    component: RootLayout,
})

// Create routes
const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/",
    component: Dashboard,
})

// Ingredients routes
const ingredientsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/ingredients",
    component: IngredientsPage,
})

const newIngredientRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/ingredients/new",
    component: IngredientForm,
})

const ingredientDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/ingredients/$ingredientId",
    component: IngredientDetail,
})

const editIngredientRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/ingredients/$ingredientId/edit",
    component: IngredientForm,
})

// Recipe routes

const recipesRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/recipes",
    component: RecipesPage,
})

const newRecipeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/recipes/new",
    component: RecipeForm,

})

const recipeDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/recipes/$recipeId",
    component: RecipeDetail,
})

const editRecipeRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/recipes/$recipeId/edit",
    component: RecipeForm,
})

/// --- Event Routes (Loaders added here) ---
const eventsIndexRoute = createRoute({ 
    getParentRoute: () => rootRoute, 
    path: "/events", component: EventsPage 
});

export const newEventRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/events/new", // Path string is the default ID
    component: EventForm,
    loader: (): NewEventContext => {
        console.log("Loader executing for /events/new");
        return { mode: 'new' };
    },
});

// Event Detail Route (no loader needed for detail display page itself)
const eventDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/events/$eventId",
    component: EventDetail,
});
// Edit Event Route with Loader
export const editEventRoute = createRoute({ // *** Export ***
    getParentRoute: () => rootRoute,
    path: "/events/$eventId/edit", // Path string is the default ID
    component: EventForm,
    loader: ({ params }): EditContext => {
        console.log("Loader executing for /events/$eventId/edit with params:", params);
        const eventId = Number.parseInt(params.eventId, 10);
        if (isNaN(eventId)) { throw new Error("Invalid Event ID"); }
        return { mode: 'edit', id: eventId };
    },
});

const comingSoonRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/coming-soon",
    component: ComingSoon,
})

const underConstructionRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/under-construction",
    component: UnderConstruction,
})

const notFoundRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "*",
    component: NotFound,
})

// Create the route tree
export const routeTree = rootRoute.addChildren([
    indexRoute,
    ingredientsRoute,
    newIngredientRoute,
    ingredientDetailRoute,
    editIngredientRoute,
    recipesRoute,
    newRecipeRoute,
    recipeDetailRoute,
    editRecipeRoute,
    // Events
    eventsIndexRoute,
    newEventRoute,
    eventDetailRoute,
    editEventRoute,
    comingSoonRoute,
    underConstructionRoute,
    notFoundRoute,
])

// Create and export the router
export const router = createRouter({ routeTree })

// Register the router for type safety
declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
        routeTree: typeof routeTree;
        // Tell TypeScript the shape of loaderData for specific route paths
        '/events/new': { LoaderData: NewContext; };
        '/events/$eventId/edit': { LoaderData: EditContext; };
        '/recipes/new': { LoaderData: NewContext; }; // Recipe contexts
        '/recipes/$recipeId/edit': { LoaderData: EditContext; };
    }
}