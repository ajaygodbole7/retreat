import { createRootRoute, createRoute, createRouter } from '@tanstack/react-router'
import { RootLayout } from './components/layouts/RootLayout'
import { HomePage } from './features/home/HomePage'
import { IngredientsPage } from './features/ingredients/IngredientsPage'
import { IngredientForm } from './features/ingredients/IngredientForm'
import { IngredientDetail } from './features/ingredients/IngredientDetail'
import { NotFoundPage } from './features/errors/NotFoundPage'

// Create the root route
export const rootRoute = createRootRoute({
    component: RootLayout,
})

// Create routes
const indexRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/',
    component: HomePage,
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
    component: () => <IngredientForm />,
})

const ingredientDetailRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/ingredients/$ingredientId',
    component: ({ params }) => <IngredientDetail ingredientId={Number(params.ingredientId)} />,
})

const editIngredientRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '/ingredients/$ingredientId/edit',
    component: ({ params }) => <IngredientForm ingredientId={Number(params.ingredientId)} />,
})

const notFoundRoute = createRoute({
    getParentRoute: () => rootRoute,
    path: '*',
    component: NotFoundPage,
})

// Create the route tree
export const routeTree = rootRoute.addChildren([
    indexRoute,
    ingredientsRoute,
    newIngredientRoute,
    ingredientDetailRoute,
    editIngredientRoute,
    notFoundRoute,
])