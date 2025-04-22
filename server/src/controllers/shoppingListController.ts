// src/controllers/shoppingListController.ts
import { Request, Response, NextFunction } from 'express';
import * as shoppingListService from '../services/shoppingListService';
import { AppError } from '../middleware/errorHandler';
import { HttpStatus } from '../constants/httpStatus';
import { parseBody, parseIdParam, parseQuery } from '../utils/validateRequestUtils';
import { getCurrentUserId } from '../utils/whoUtils';
// Import Zod schemas AND the resulting validated types
import {
    updateShoppingListSchema,
    updateShoppingListItemSchema,
    getConsolidatedListQuerySchema,
    type ValidatedUpdateShoppingListInput,
    type ValidatedUpdateShoppingListItemInput,
    type ValidatedConsolidatedListCriteria
} from '../schemas/shoppingListSchemas';

// --- Event-Specific Shopping List ---

/**
 * Get the shopping list for a specific event
 */
export const getEventShoppingList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const eventId = parseIdParam(req, 'eventId');
        const shoppingList = await shoppingListService.getStoredEventShoppingList(eventId);
        res.status(HttpStatus.OK).json(shoppingList ?? null);
    } catch (error) {
        next(error);
    }
};

/**
 * Generate or replace the shopping list for a specific event
 */
export const generateAndStoreEventList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const eventId = parseIdParam(req, 'eventId');
        const userId = getCurrentUserId(req);
        const shoppingList = await shoppingListService.generateAndStoreEventShoppingList(eventId, userId);
        res.status(HttpStatus.OK).json(shoppingList);
    } catch (error) {
        next(error);
    }
};

// --- Shopping List Item Updates ---

/**
 * Update a specific shopping list item
 */
export const updateShoppingListItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const itemId = parseIdParam(req, 'itemId');
        const data: ValidatedUpdateShoppingListItemInput = parseBody(req, updateShoppingListItemSchema);
        const userId = getCurrentUserId(req);

        if (Object.keys(data).length === 0) {
            throw new AppError('No update data provided', HttpStatus.BAD_REQUEST);
        }

        const updatedItem = await shoppingListService.updateShoppingListItem(itemId, data, userId);
        res.status(HttpStatus.OK).json(updatedItem);
    } catch (error) {
        if ((error as any)?.code === 'P2025') {
            next(new AppError('Shopping list item not found', HttpStatus.NOT_FOUND));
        } else {
            next(error);
        }
    }
};

// --- Consolidated Shopping List ---

/**
 * Get a consolidated shopping list based on query parameters
 */
export const getConsolidatedShoppingList = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const criteria: ValidatedConsolidatedListCriteria = parseQuery(req, getConsolidatedListQuerySchema);
        const groupedList = await shoppingListService.generateConsolidatedShoppingList(criteria);
        res.status(HttpStatus.OK).json(groupedList);
    } catch (error) {
        next(error);
    }
};

// --- Optional: Direct Shopping List Updates ---

/**
 * Update shopping list details (top-level fields only)
 */
export const updateShoppingListDetails = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const listId = parseIdParam(req, 'listId');
        const data: ValidatedUpdateShoppingListInput = parseBody(req, updateShoppingListSchema);
        const userId = getCurrentUserId(req);

        if (Object.keys(data).length === 0) {
            throw new AppError('No update data provided', HttpStatus.BAD_REQUEST);
        }

        const updatedList = await shoppingListService.updateShoppingListDetails(listId, data, userId);
        res.status(HttpStatus.OK).json(updatedList);
    } catch (error) {
        if ((error as any)?.code === 'P2025') {
            next(new AppError('Shopping list not found', HttpStatus.NOT_FOUND));
        } else {
            next(error);
        }
    }
};