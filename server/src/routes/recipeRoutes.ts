import express from 'express';
import {
    getAllRecipes,
    getRecipeById,
    createRecipe,
    updateRecipe,
    deleteRecipe,
    getRecipeSteps,
    getRecipeStepById,
    createRecipeStep,
    updateRecipeStep,
    deleteRecipeStep,
    getRecipeIngredients,
    getRecipeIngredientById,
    createRecipeIngredient,
    updateRecipeIngredient,
    deleteRecipeIngredient
} from '../controllers/recipeController';
import { validateRequest } from '../middleware/validateRequest';
import {
    createRecipeSchema,
    updateRecipeSchema,
    getRecipesQuerySchema,
    createRecipeStepSchema,
    updateRecipeStepSchema,
    createRecipeIngredientSchema,
    updateRecipeIngredientSchema
} from '../schemas/recipeSchemas';

const router = express.Router();

// Recipe routes
router.get('/', validateRequest({ query: getRecipesQuerySchema }), getAllRecipes);
router.get('/:id', getRecipeById);
router.post('/', validateRequest({ body: createRecipeSchema }), createRecipe);
router.put('/:id', validateRequest({ body: updateRecipeSchema }), updateRecipe);
router.delete('/:id', deleteRecipe);

// Recipe step routes
router.get('/:recipeId/steps', getRecipeSteps);
router.get('/steps/:id', getRecipeStepById);
router.post('/steps', validateRequest({ body: createRecipeStepSchema }), createRecipeStep);
router.put('/steps/:id', validateRequest({ body: updateRecipeStepSchema }), updateRecipeStep);
router.delete('/steps/:id', deleteRecipeStep);

// Recipe ingredient routes
router.get('/:recipeId/ingredients', getRecipeIngredients);
router.get('/ingredients/:id', getRecipeIngredientById);
router.post('/ingredients', validateRequest({ body: createRecipeIngredientSchema }), createRecipeIngredient);
router.put('/ingredients/:id', validateRequest({ body: updateRecipeIngredientSchema }), updateRecipeIngredient);
router.delete('/ingredients/:id', deleteRecipeIngredient);

export { router as recipeRoutes };