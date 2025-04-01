import express from 'express';
import * as scheduledMealController from '../controllers/scheduledMealController';
import { validateRequest } from '../middleware/validateRequest';
import { updateScheduledMealSchema, scheduledMealRecipeSchema } from '../schemas/scheduledMealSchemas';

const router = express.Router();

// Routes for managing individual scheduled meals (GET might be handled via EventDay)
router.put('/:mealId', validateRequest({ body: updateScheduledMealSchema }), scheduledMealController.updateMeal);
router.delete('/:mealId', scheduledMealController.deleteMeal);

// Routes for managing recipes directly linked to a scheduled meal
router.post('/:mealId/recipes', validateRequest({ body: scheduledMealRecipeSchema }), scheduledMealController.addRecipeToScheduledMeal);
router.delete('/:mealId/recipes/:recipeId', scheduledMealController.removeRecipeFromScheduledMeal);

export { router as scheduledMealRoutes };