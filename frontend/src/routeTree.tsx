// frontend/src/routeTree.tsx
import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { RootLayout } from './components/layouts/RootLayout'
import { HomePage } from './features/home/HomePage'
import { IngredientsPage } from './features/ingredients/IngredientsPage'
import { IngredientForm } from './features/ingredients/IngredientForm'
import { IngredientDetail } from './features/ingredients/IngredientDetail'
//import { NotFoundPage } from './features/errors/NotFoundPage'
import ComingSoon from "./pages/ComingSoon"
import NotFound from "./pages/NotFound"
import UnderConstruction from "./pages/UnderConstruction"
import Dashboard from './pages/DashboardNew'

// Create the root route
export const rootRoute = createRootRoute({
    component: RootLayout,
})

// Create routes
const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    //component: HomePage,
    component: Dashboard,
})

// Ingredients routes
const ingredientsRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/ingredients',
    component: IngredientsPage,
})

const newIngredientRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/ingredients/new',
    component: IngredientForm,
})

const ingredientDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/ingredients/$ingredientId',
    component: IngredientDetail,
})

const editIngredientRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/ingredients/$ingredientId/edit',
    component: IngredientForm,
})
/*
const notFoundRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '*',
    component: NotFoundPage,
})
    */

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
    comingSoonRoute,
    underConstructionRoute,
    notFoundRoute,
])

// Create and export the router
export const router = createRouter({ routeTree })

// Register the router for type safety
declare module '@tanstack/react-router' {
    interface Register {
        router: typeof router
    }
}

// Debug logging
console.log('Route Tree initialized:', routeTree);