// src/routes/shoppingListRoutes.ts
import express from 'express';
import * as shoppingListController from '../controllers/shoppingListController';
import { validateRequest } from '../middleware/validateRequest';
import {
    updateShoppingListItemSchema,
    getConsolidatedListQuerySchema,
    updateShoppingListSchema
} from '../schemas/shoppingListSchemas';

const router = express.Router();

// Shopping List Items (Updates Only)
router.put(
    '/shopping-lists/items/:itemId',
    validateRequest({ body: updateShoppingListItemSchema }),
    shoppingListController.updateShoppingListItem
);

// Consolidated Shopping List
router.get(
    '/shopping-lists/consolidated',
    validateRequest({ query: getConsolidatedListQuerySchema }),
    shoppingListController.getConsolidatedShoppingList
);

// Optional: Direct update of shopping list details (if needed)
router.put(
    '/shopping-lists/:listId',
    validateRequest({ body: updateShoppingListSchema }),
    shoppingListController.updateShoppingListDetails
);

export { router as shoppingListRoutes };