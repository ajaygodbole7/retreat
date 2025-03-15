import express from 'express';
import {
    getIngredients,
    getIngredientById,
    createIngredient,
    updateIngredient,
    deleteIngredient
} from '../controllers/ingredientController';
import { validateRequest } from '../middleware/validateRequest';
import {
    createIngredientSchema,
    updateIngredientSchema,
    getIngredientsQuerySchema
} from '../schemas/ingredientSchemas';

const router = express.Router();

router.get('/', validateRequest({ query: getIngredientsQuerySchema }), getIngredients);
router.get('/:id', getIngredientById);
router.post('/', validateRequest({ body: createIngredientSchema }), createIngredient);
router.put('/:id', validateRequest({ body: updateIngredientSchema }), updateIngredient);
router.delete('/:id', deleteIngredient);

export { router as ingredientRoutes };