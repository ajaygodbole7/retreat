// src/routeTree.tsx
import {
    createRootRouteWithContext,
    createRoute,
    createRouter,
    redirect,
    Outlet,
    // Import types for route configuration and context
    type BeforeLoadContext,
    type RouteContext,
    type RouteOptions, // Import RouteOptions for cleaner loader typing
    type RouteConfig // Import RouteConfig
} from "@tanstack/react-router";
import { RootLayout } from "./components/layouts/RootLayout";
import type { AuthContextType } from './contexts/auth-context'; // Ensure path is correct

// Import Pages/Components
import { IngredientsPage } from "./features/ingredients/IngredientsPage";
import { IngredientForm } from "./features/ingredients/IngredientForm";
import { IngredientDetail } from "./features/ingredients/IngredientDetail";
import { RecipesPage } from "./features/recipes/RecipesPage";
import { RecipeDetail } from "./features/recipes/RecipeDetail";
import { RecipeForm } from "./features/recipes/RecipeFormGemini";
import { EventsPage } from "./features/events/EventsPage";
import { EventForm } from "./features/events/EventForm";
import { EventDetail } from "./features/events/EventDetail";
import { LoginPage } from "./features/auth/LoginPage"; // Assuming moved
import { RegisterPage } from "./features/auth/RegisterPage"; // Assuming moved
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";
import UnderConstruction from "./pages/UnderConstruction";
import Dashboard from "./pages/DashboardNew";
import { Loader2 } from "lucide-react";

// --- Define Router Context Interface ---
interface MyRouterContext extends RouteContext {
    auth: AuthContextType;
}

// --- Type Helper for Loader Context ---
// Defines the shape of data returned by loaders for Edit/New forms
interface EditContext { mode: 'edit'; id: number }
interface NewContext { mode: 'new' }
// Union type for components handling both modes
type FormRouteLoaderData = EditContext | NewContext;

// --- Create Root Route with Context ---
export const rootRoute = createRootRouteWithContext<MyRouterContext>()({
    component: RootLayout,
    // Optional: Global pending component
    // pendingComponent: () => <div className="p-4 text-center"><Loader2 className="h-6 w-6 animate-spin inline-block" /></div>,
});

// --- Authentication Guard Function ---
const ensureAuthenticated = ({ context, location }: BeforeLoadContext<MyRouterContext>) => {
    if (!context.auth.isLoading && !context.auth.isAuthenticated) {
        throw redirect({ to: '/login', search: { redirect: location.href }, replace: true });
    }
};

// --- Define Public Routes ---
const loginRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/login",
    component: LoginPage,
    beforeLoad: ({ context }) => { if (!context.auth.isLoading && context.auth.isAuthenticated) throw redirect({ to: '/', replace: true }); }
});

const registerRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/register",
    component: RegisterPage,
    beforeLoad: ({ context }) => { if (!context.auth.isLoading && context.auth.isAuthenticated) throw redirect({ to: '/', replace: true }); }
});

const comingSoonRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/coming-soon",
    component: ComingSoon
});
const underConstructionRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "/under-construction",
    component: UnderConstruction
});

// --- Define Authenticated Parent Route ---
const authenticatedRoute = createRoute({
    getParentRoute: () => rootRoute,
    id: 'authenticated',
    beforeLoad: ensureAuthenticated, // Apply guard here
    pendingComponent: () => ( // Loading state for protected section
        <div className="flex justify-center items-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" /><span className="ml-2">Loading...</span>
        </div>
    ),
    component: () => <Outlet />, // Render children
});

// --- Define Protected Routes (Children of authenticatedRoute) ---

// Dashboard
const indexRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: "/",
    component: Dashboard
});

// --- Ingredients ---
const ingredientsRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: "/ingredients",
    component: IngredientsPage
});
// New Ingredient Route - Needs Loader for mode
const newIngredientRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: "/ingredients/new",
    component: IngredientForm,
    loader: (): NewContext => ({ mode: 'new' }) // Provide 'new' mode context
});
const ingredientDetailRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: "/ingredients/$ingredientId",
    component: IngredientDetail,
    // Optional: Loader to fetch ingredient data *before* component renders
    // loader: async ({ params }) => ingredientApi.getById(Number(params.ingredientId)),
});
// Edit Ingredient Route - Needs Loader for mode and ID
const editIngredientRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: "/ingredients/$ingredientId/edit",
    component: IngredientForm,
    loader: ({ params }): EditContext => { // Provide 'edit' mode context and ID
        const id = Number.parseInt(params.ingredientId, 10);
        if (isNaN(id)) throw new Error("Invalid Ingredient ID");
        return { mode: 'edit', id };
    }
});

// --- Recipes ---
const recipesRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: "/recipes", component: RecipesPage });
// New Recipe Route - Needs Loader for mode
const newRecipeRoute = createRoute({
    getParentRoute: () => authenticatedRoute, // Corrected parent
    path: "/recipes/new",
    component: RecipeForm,
    loader: (): NewContext => ({ mode: 'new' }) // Provide 'new' mode context
});
const recipeDetailRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: "/recipes/$recipeId",
    component: RecipeDetail,
    // Optional: Loader to fetch recipe data
    // loader: async ({ params }) => recipeApi.getById(Number(params.recipeId)),
});
// Edit Recipe Route - Needs Loader for mode and ID
const editRecipeRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: "/recipes/$recipeId/edit",
    component: RecipeForm,
    loader: ({ params }): EditContext => { // Provide 'edit' mode context and ID
        const id = Number.parseInt(params.recipeId, 10);
        if (isNaN(id)) throw new Error("Invalid Recipe ID");
        return { mode: 'edit', id };
    }
});

// --- Events ---
const eventsIndexRoute = createRoute({ getParentRoute: () => authenticatedRoute, path: "/events", component: EventsPage });
// New Event Route - Needs Loader for mode
const newEventRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: "/events/new",
    component: EventForm,
    loader: (): NewContext => ({ mode: 'new' }) // Provide 'new' mode context
});
const eventDetailRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: "/events/$eventId",
    component: EventDetail,
    // Optional: Loader to fetch event data
    // loader: async ({ params }) => eventApi.getById(Number(params.eventId)),
});
// Edit Event Route - Needs Loader for mode and ID
const editEventRoute = createRoute({
    getParentRoute: () => authenticatedRoute,
    path: "/events/$eventId/edit",
    component: EventForm,
    loader: ({ params }): EditContext => { // Provide 'edit' mode context and ID
        const id = Number.parseInt(params.eventId, 10);
        if (isNaN(id)) throw new Error("Invalid Event ID");
        return { mode: 'edit', id };
    }
});

// --- Not Found Route ---
const notFoundRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: "*",
    component: NotFound,
});

// --- Build Route Tree ---
export const routeTree = rootRoute.addChildren([
    // Public Routes
    loginRoute,
    registerRoute,
    comingSoonRoute,
    underConstructionRoute,

    // Authenticated Section
    authenticatedRoute.addChildren([
        indexRoute,
        // Ingredients
        ingredientsRoute,
        newIngredientRoute,     // Now has loader
        ingredientDetailRoute,
        editIngredientRoute,    // Now has loader
        // Recipes
        recipesRoute,
        newRecipeRoute,         // Now has loader & correct parent
        recipeDetailRoute,
        editRecipeRoute,        // Now has loader
        // Events
        eventsIndexRoute,
        newEventRoute,          // Now has loader
        eventDetailRoute,
        editEventRoute,         // Now has loader
        // ... other protected routes
    ]),

    // Catch-all Not Found Route (must be last)
    notFoundRoute,
]);

// --- Create Router Instance ---
export const router = createRouter({
    routeTree,
    context: { auth: undefined! },
});

// --- Register Router Types ---
// Define Params, Search, and LoaderData for type safety
declare module "@tanstack/react-router" {
    interface Register {
        router: typeof router;
        routeTree: typeof routeTree;

        // --- Define Params (string from URL) ---
        '/ingredients/$ingredientId': { Params: { ingredientId: string } };
        '/ingredients/$ingredientId/edit': { Params: { ingredientId: string } };
        '/recipes/$recipeId': { Params: { recipeId: string } };
        '/recipes/$recipeId/edit': { Params: { recipeId: string } };
        '/events/$eventId': { Params: { eventId: string } };
        '/events/$eventId/edit': { Params: { eventId: string } };

        // --- Define Search Params ---
        '/login': { Search: LoginSearch };

        // --- Define Loader Data (Matches loader return types) ---
        // ** All New/Edit routes now have loaders **
        '/ingredients/new': { LoaderData: NewContext };
        '/ingredients/$ingredientId/edit': { LoaderData: EditContext };
        '/recipes/new': { LoaderData: NewContext };
        '/recipes/$recipeId/edit': { LoaderData: EditContext };
        '/events/new': { LoaderData: NewContext };
        '/events/$eventId/edit': { LoaderData: EditContext };
    }
    // Define LoginSearch interface if needed
    interface LoginSearch {
        redirect?: string;
    }
}