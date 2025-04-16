import express from 'express';
import * as menuController from '../controllers/menuController';
import { validateRequest } from '../middleware/validateRequest';
import { createMenuSchema, updateMenuSchema, menuRecipeSchema } from '../schemas/menuSchemas'; // Use correct schema name

const router = express.Router();

router.get('/', menuController.getAllMenus);
router.post('/', validateRequest({ body: createMenuSchema }), menuController.createMenu);
router.get('/:id', menuController.getMenuById); // Use :id for consistency
router.put('/:id', validateRequest({ body: updateMenuSchema }), menuController.updateMenu);
router.delete('/:id', menuController.deleteMenu);

// MenuRecipe Items (Recipes within a menu template)
router.post('/:menuId/recipes', validateRequest({ body: menuRecipeSchema }), menuController.addRecipeToMenu); // Changed path slightly
router.delete('/:menuId/recipes/:recipeId', menuController.removeRecipeFromMenu); // Changed path slightly

export { router as menuRoutes };