// src/services/shoppingListService.ts

import prisma from '../lib/prisma';
import { ensureArray } from '../utils/array-utils';
import { AppError } from '../middleware/errorHandler';
import { HttpStatus } from '../constants/httpStatus';
import { addCreationTracking, addUpdateTracking } from '../utils/whoUtils';

// Import necessary Prisma-generated types - removed unused imports
import type {
    Prisma,
    Event, EventDay, EventDayConsumable, ScheduledMeal, ScheduledMealRecipe,
    Recipe, RecipeIngredient as ServerRecipeIngredient,
    Ingredient, UnitOfMeasure, IngredientCategory,
} from '@prisma/client';

// Import Shared Types ONLY for output/internal aggregation structures - removed unused imports
import type {
    GroupedShoppingList,
    AggregatedShoppingItem,
    ShoppingListData,
    ShoppingListWithItems,
    ShoppingListItemData
} from '../types/shopping-list-types';

// Import VALIDATED input types inferred from Zod schemas
import type {
    ValidatedUpdateShoppingListInput,
    ValidatedUpdateShoppingListItemInput,
    ValidatedConsolidatedListCriteria
} from '../schemas/shoppingListSchemas';

// --- Internal Type Definitions for Prisma Includes ---
type PrismaIngredientWithCategory = Ingredient & { category: IngredientCategory | null; };
type PrismaRecipeIngredientWithDetails = ServerRecipeIngredient & { ingredient: PrismaIngredientWithCategory; unit: UnitOfMeasure; };
type PrismaRecipeWithDetails = Recipe & { recipeIngredients: PrismaRecipeIngredientWithDetails[]; };
type PrismaScheduledMealRecipeWithDetails = ScheduledMealRecipe & { recipe: PrismaRecipeWithDetails | null; };
type PrismaScheduledMealWithDetails = ScheduledMeal & { scheduledMealRecipes: PrismaScheduledMealRecipeWithDetails[]; };
type PrismaEventDayConsumableWithDetails = EventDayConsumable & { ingredient: PrismaIngredientWithCategory; unit: UnitOfMeasure; };
type PrismaEventDayWithDetails = EventDay & { consumables: PrismaEventDayConsumableWithDetails[]; scheduledMeals: PrismaScheduledMealWithDetails[]; };
type FullEventDetailsPrisma = Event & { days: PrismaEventDayWithDetails[]; };

// --- Constants ---
const DEFAULT_RECIPE_SERVING_SIZE = 8;
const DEFAULT_CONSUMABLE_SERVING_SIZE = 8;

// --- Helper Functions ---

/**
 * Rounds a quantity to a practical value for shopping
 * @param quantity The quantity to round
 * @returns The rounded quantity
 */
function roundQuantity(quantity: number): number {
    if (quantity <= 0) return 0;

    // For small quantities, round to 2 decimal places
    if (quantity < 1) {
        return Math.ceil(quantity * 100) / 100;
    }

    // For medium quantities, round to 1 decimal place
    if (quantity < 10) {
        return Math.ceil(quantity * 10) / 10;
    }

    // For large quantities, round to nearest whole number
    return Math.ceil(quantity);
}

/**
 * Fetches full event data with all related entities needed for shopping list generation
 * @param tx Prisma transaction client or prisma instance
 * @param eventId Event ID to fetch
 * @returns Full event data with all related entities
 * @throws AppError if event not found
 */
async function _fetchFullEventData(tx: Prisma.TransactionClient | typeof prisma, eventId: number): Promise<FullEventDetailsPrisma> {
    if (!eventId || isNaN(eventId) || eventId <= 0) {
        throw new AppError(`Invalid event ID: ${ eventId }`, HttpStatus.BAD_REQUEST);
    }

    const eventData = await tx.event.findUnique({
        where: { id: eventId },
        include: {
            days: {
                orderBy: { dayNumber: 'asc' },
                include: {
                    consumables: {
                        include: {
                            ingredient: { include: { category: true } },
                            unit: true
                        },
                        orderBy: { ingredient: { name: 'asc' } }
                    },
                    scheduledMeals: {
                        orderBy: { time: 'asc' },
                        include: {
                            menu: { select: { id: true, name: true } },
                            scheduledMealRecipes: {
                                include: {
                                    recipe: {
                                        include: {
                                            recipeIngredients: {
                                                include: {
                                                    ingredient: { include: { category: true } },
                                                    unit: true
                                                },
                                                orderBy: { displayOrder: 'asc' }
                                            }
                                        }
                                    }
                                },
                                orderBy: { recipe: { name: 'asc' } }
                            }
                        }
                    }
                }
            }
        }
    });

    if (!eventData) {
        throw new AppError(`Event with ID ${ eventId } not found`, HttpStatus.NOT_FOUND);
    }

    return eventData as FullEventDetailsPrisma;
}

/**
 * Calculates shopping list needs for an event
 * @param eventData Full event data with all related entities
 * @param shouldRound Whether to round quantities to practical values
 * @returns Map of ingredient-unit keys to aggregated shopping items
 */
function _calculateNeedsForEvent(
    eventData: FullEventDetailsPrisma,
    shouldRound: boolean = true
): Map<string, AggregatedShoppingItem> {
    const aggregatedItems = new Map<string, AggregatedShoppingItem>();
    const defaultRecipeSize = DEFAULT_RECIPE_SERVING_SIZE;
    const defaultConsumableSize = DEFAULT_CONSUMABLE_SERVING_SIZE;

    // Process each day in the event
    ensureArray(eventData.days).forEach(day => {
        // Process Day Consumables
        const dayHeadcount = (day.attendeeHeadcountForDay ?? 0) + (day.volunteerHeadcountForDay ?? 0);
        if (dayHeadcount > 0) {
            ensureArray(day.consumables).forEach(consumable => {
                // Skip if ingredient or unit is missing
                if (!consumable.ingredient || !consumable.unit) {
                    console.warn(`WARN: Skipping day consumable ID ${ consumable.id } due to missing ingredient or unit.`);
                    return;
                }

                const key = `${ consumable.ingredientId }-${ consumable.unitId }`;
                // Prevent division by zero
                const consumableBaseSize = consumable.baseServingSize > 0 ?
                    consumable.baseServingSize : defaultConsumableSize;
                const dayScaleFactor = dayHeadcount / consumableBaseSize;
                const scaledQuantity = consumable.baseServingQuantity * dayScaleFactor;

                const existing = aggregatedItems.get(key);
                if (existing) {
                    existing.totalQuantity += scaledQuantity;
                    if (shouldRound) {
                        existing.roundedQuantity = roundQuantity(existing.totalQuantity);
                    }
                } else {
                    const newItem: AggregatedShoppingItem = {
                        ingredientId: consumable.ingredientId,
                        ingredientName: consumable.ingredient.name,
                        unitId: consumable.unitId,
                        unitAbbreviation: consumable.unit.abbreviation || consumable.unit.name,
                        totalQuantity: scaledQuantity,
                        categoryId: consumable.ingredient.categoryId ?? null,
                        categoryName: consumable.ingredient.category?.name ?? null
                    };

                    if (shouldRound) {
                        newItem.roundedQuantity = roundQuantity(scaledQuantity);
                    }

                    aggregatedItems.set(key, newItem);
                }
            });
        }

        // Process Meal Recipes
        ensureArray(day.scheduledMeals).forEach(meal => {
            const mealHeadcount = (meal.attendeeHeadcount ?? 0) + (meal.volunteerHeadcount ?? 0);
            if (mealHeadcount <= 0) return;

            ensureArray(meal.scheduledMealRecipes).forEach(mealRecipe => {
                const recipe = mealRecipe.recipe;
                // Enhanced error handling for missing recipe or ingredients
                if (!recipe) {
                    console.warn(`WARN: Skipping meal recipe ID ${ mealRecipe.id } due to missing recipe reference.`);
                    return;
                }

                if (!recipe.recipeIngredients || recipe.recipeIngredients.length === 0) {
                    console.warn(`WARN: Skipping recipe ID ${ recipe.id } (${ recipe.name }) due to missing ingredients.`);
                    return;
                }

                // Prevent division by zero
                const recipeBaseServingSize = recipe.servingSize > 0 ?
                    recipe.servingSize : defaultRecipeSize;
                const mealScaleFactor = mealHeadcount / recipeBaseServingSize;

                ensureArray(recipe.recipeIngredients).forEach(recipeIngredient => {
                    // Skip if ingredient or unit is missing
                    if (!recipeIngredient.ingredient || !recipeIngredient.unit) {
                        console.warn(`WARN: Skipping recipe ingredient ID ${ recipeIngredient.id } due to missing ingredient or unit.`);
                        return;
                    }

                    const key = `${ recipeIngredient.ingredientId }-${ recipeIngredient.unitId }`;
                    const ingredientScaleFactor = recipeIngredient.scalingFactor ?? 1.0;
                    const scaledQuantity = recipeIngredient.quantity * mealScaleFactor * ingredientScaleFactor;

                    const existing = aggregatedItems.get(key);
                    if (existing) {
                        existing.totalQuantity += scaledQuantity;
                        if (shouldRound) {
                            existing.roundedQuantity = roundQuantity(existing.totalQuantity);
                        }
                    } else {
                        const newItem: AggregatedShoppingItem = {
                            ingredientId: recipeIngredient.ingredientId,
                            ingredientName: recipeIngredient.ingredient.name,
                            unitId: recipeIngredient.unitId,
                            unitAbbreviation: recipeIngredient.unit.abbreviation || recipeIngredient.unit.name,
                            totalQuantity: scaledQuantity,
                            categoryId: recipeIngredient.ingredient.categoryId ?? null,
                            categoryName: recipeIngredient.ingredient.category?.name ?? null
                        };

                        if (shouldRound) {
                            newItem.roundedQuantity = roundQuantity(scaledQuantity);
                        }

                        aggregatedItems.set(key, newItem);
                    }
                });
            });
        });
    });

    return aggregatedItems;
}

/**
 * Groups shopping list items by category
 * @param itemsMap Map of ingredient-unit keys to aggregated shopping items
 * @returns Shopping list grouped by category
 */
function _groupShoppingListItems(itemsMap: Map<string, AggregatedShoppingItem>): GroupedShoppingList {
    const groupedList: GroupedShoppingList = {};

    // Group items by category
    itemsMap.forEach(item => {
        const categoryName = item.categoryName ?? "Uncategorized";
        if (!groupedList[categoryName]) {
            groupedList[categoryName] = [];
        }
        groupedList[categoryName].push(item);
    });

    // Sort items within each category by ingredient name
    for (const categoryName in groupedList) {
        groupedList[categoryName].sort((a, b) => a.ingredientName.localeCompare(b.ingredientName));
    }

    // Sort categories, keeping "Uncategorized" at the end
    const sortedCategoryNames = Object.keys(groupedList).sort((a, b) => {
        if (a === "Uncategorized") return 1;
        if (b === "Uncategorized") return -1;
        return a.localeCompare(b);
    });

    // Create a new object with sorted categories
    const sortedGroupedList: GroupedShoppingList = {};
    sortedCategoryNames.forEach(categoryName => {
        sortedGroupedList[categoryName] = groupedList[categoryName];
    });

    return sortedGroupedList;
}

/**
 * Updates inventory based on purchased items
 * @param itemId Shopping list item ID
 * @param purchasedQuantity Quantity purchased
 * @param userId User ID for tracking
 */
/* 
// Commented out as requested
async function _updateInventory(itemId: number, purchasedQuantity: number, userId?: string): Promise<void> {
    // Implementation commented out
}
*/

// --- Event-Specific Shopping List ---

/**
 * Gets a stored shopping list for an event
 * @param eventId Event ID
 * @returns Shopping list with items, or null if not found
 */
export const getStoredEventShoppingList = async (
    eventId: number
): Promise<ShoppingListWithItems | null> => {
    if (!eventId || isNaN(eventId) || eventId <= 0) {
        throw new AppError(`Invalid event ID: ${ eventId }`, HttpStatus.BAD_REQUEST);
    }

    const list = await prisma.shoppingList.findUnique({
        where: { eventId },
        include: {
            items: {
                include: {
                    ingredient: {
                        select: {
                            id: true,
                            name: true,
                            categoryId: true,
                            category: {
                                select: { name: true }
                            }
                        }
                    },
                    unit: {
                        select: {
                            id: true,
                            name: true,
                            abbreviation: true
                        }
                    }
                },
                orderBy: [
                    { categoryName: 'asc' },
                    { ingredientName: 'asc' }
                ]
            },
            event: {
                select: { eventName: true }
            }
        }
    });

    if (!list) {
        return null;
    }

    return {
        ...list,
        eventName: list.event?.eventName,
        items: list.items as unknown as ShoppingListItemData[]
    } as unknown as ShoppingListWithItems;
};

/**
 * Generates and stores a shopping list for an event
 * @param eventId Event ID
 * @param userId User ID for tracking
 * @returns Shopping list with items
 */
export const generateAndStoreEventShoppingList = async (
    eventId: number,
    userId?: string
): Promise<ShoppingListWithItems> => {
    return await prisma.$transaction(async (tx) => {
        const eventData = await _fetchFullEventData(tx, eventId);
        const aggregatedMap = _calculateNeedsForEvent(eventData, true); // Always round quantities

        const now = new Date();
        const listTrackingUpdate = addUpdateTracking({}, userId);
        const listTrackingCreate = addCreationTracking({}, userId);

        // 1. Upsert List to get ID
        const list = await tx.shoppingList.upsert({
            where: { eventId: eventId },
            update: {
                status: "GENERATED",
                generatedAt: now,
                lastUpdatedBy: listTrackingUpdate.lastUpdatedBy,
                updatedAt: listTrackingUpdate.updatedAt
            },
            create: {
                eventId: eventId,
                status: "GENERATED",
                generatedAt: now,
                createdBy: listTrackingCreate.createdBy,
                lastUpdatedBy: listTrackingCreate.lastUpdatedBy
            }
        });

        // 2. Delete existing items
        await tx.shoppingListItem.deleteMany({ where: { shoppingListId: list.id } });

        // 3. Prepare new items data including shoppingListId
        const itemsToCreateData: Prisma.ShoppingListItemCreateManyInput[] = [];
        aggregatedMap.forEach(item => {
            const trackingData = addCreationTracking({}, userId);
            itemsToCreateData.push({
                shoppingListId: list.id,
                ingredientId: item.ingredientId,
                unitId: item.unitId,
                ingredientName: item.ingredientName,
                unitAbbreviation: item.unitAbbreviation,
                categoryId: item.categoryId,
                categoryName: item.categoryName,
                calculatedQuantity: item.roundedQuantity ?? item.totalQuantity, // Use rounded quantity if available
                status: "NEEDED", // Use Prisma Enum value
                createdBy: trackingData.createdBy,
                lastUpdatedBy: trackingData.lastUpdatedBy,
            });
        });

        // 4. Create new items
        if (itemsToCreateData.length > 0) {
            await tx.shoppingListItem.createMany({
                data: itemsToCreateData,
                skipDuplicates: true
            });
        }

        // 5. Fetch and return final list
        const finalList = await tx.shoppingList.findUniqueOrThrow({
            where: { id: list.id },
            include: {
                items: {
                    include: {
                        ingredient: {
                            select: {
                                id: true,
                                name: true,
                                categoryId: true,
                                category: {
                                    select: { name: true }
                                }
                            }
                        },
                        unit: {
                            select: {
                                id: true,
                                name: true,
                                abbreviation: true
                            }
                        }
                    },
                    orderBy: [
                        { categoryName: 'asc' },
                        { ingredientName: 'asc' }
                    ]
                },
                event: {
                    select: { eventName: true }
                }
            }
        });

        return {
            ...finalList,
            eventName: finalList.event?.eventName,
            items: finalList.items as unknown as ShoppingListItemData[]
        } as unknown as ShoppingListWithItems;
    });
};

// --- Shopping List Item Updates ---

/**
 * Update a shopping list item
 * @param itemId Item ID
 * @param data Update data
 * @param userId User ID for tracking
 * @returns Updated shopping list item
 */
export const updateShoppingListItem = async (
    itemId: number,
    data: ValidatedUpdateShoppingListItemInput,
    userId?: string
): Promise<ShoppingListItemData> => {
    if (!itemId || isNaN(itemId) || itemId <= 0) {
        throw new AppError(`Invalid item ID: ${ itemId }`, HttpStatus.BAD_REQUEST);
    }

    const existingItem = await prisma.shoppingListItem.findUnique({
        where: { id: itemId }
    });

    if (!existingItem) {
        throw new AppError('Shopping list item not found', HttpStatus.NOT_FOUND);
    }

    // Prepare update payload from validated data
    const updatePayload: Prisma.ShoppingListItemUpdateInput = { ...data };

    if (Object.keys(updatePayload).length > 0) {
        const trackedUpdatePayload = addUpdateTracking(updatePayload, userId);
        const updatedItem = await prisma.shoppingListItem.update({
            where: { id: itemId },
            data: trackedUpdatePayload,
            include: {
                ingredient: {
                    select: {
                        id: true,
                        name: true,
                        categoryId: true,
                        category: {
                            select: { name: true }
                        }
                    }
                },
                unit: {
                    select: {
                        id: true,
                        name: true,
                        abbreviation: true
                    }
                }
            }
        });

        /* 
        // Commented out as requested
        // Update inventory if item is purchased
        if (updatedItem.status === 'PURCHASED' && 
            updatedItem.purchasedQuantity !== null && 
            updatedItem.purchasedQuantity > 0) {
            await _updateInventory(
                updatedItem.id, 
                updatedItem.purchasedQuantity, 
                userId
            );
        }
        */

        return updatedItem as unknown as ShoppingListItemData;
    } else {
        return existingItem as unknown as ShoppingListItemData;
    }
};

// --- Consolidated Shopping List ---

/**
 * Generates a consolidated shopping list for multiple events
 * @param criteria Criteria for selecting events
 * @returns Shopping list grouped by category
 */
export const generateConsolidatedShoppingList = async (
    criteria: ValidatedConsolidatedListCriteria
): Promise<GroupedShoppingList> => {
    // Build Prisma `where` clause using validated criteria
    const eventWhere: Prisma.EventWhereInput = {
        // Simplified date range logic - events that overlap with the specified date range
        eventStartDate: { lte: criteria.endDate },   // Event starts on or before the end date
        eventEndDate: { gte: criteria.startDate },   // Event ends on or after the start date
    };

    if (criteria.eventIds && criteria.eventIds.length > 0) {
        eventWhere.id = { in: criteria.eventIds };
    }

    if (criteria.eventTypes && criteria.eventTypes.length > 0) {
        eventWhere.eventType = { in: criteria.eventTypes };
    }

    // Fetch events with deep includes
    const eventsData = await prisma.event.findMany({
        where: eventWhere,
        include: { // Reuse same deep includes as _fetchFullEventData
            days: {
                orderBy: { dayNumber: 'asc' },
                include: {
                    consumables: {
                        include: {
                            ingredient: { include: { category: true } },
                            unit: true
                        }
                    },
                    scheduledMeals: {
                        orderBy: { time: 'asc' },
                        include: {
                            menu: true,
                            scheduledMealRecipes: {
                                include: {
                                    recipe: {
                                        include: {
                                            recipeIngredients: {
                                                include: {
                                                    ingredient: { include: { category: true } },
                                                    unit: true
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }) as FullEventDetailsPrisma[];

    // Aggregate across events
    const globalAggregatedItems = new Map<string, AggregatedShoppingItem>();

    eventsData.forEach(eventData => {
        const eventNeedsMap = _calculateNeedsForEvent(
            eventData,
            criteria.roundQuantities ?? true
        );

        // Merge event needs into global map
        eventNeedsMap.forEach((itemData, key) => {
            const existing = globalAggregatedItems.get(key);
            if (existing) {
                existing.totalQuantity += itemData.totalQuantity;

                // Update rounded quantity if needed
                if (criteria.roundQuantities !== false && itemData.roundedQuantity !== undefined) {
                    existing.roundedQuantity = roundQuantity(existing.totalQuantity);
                }
            } else {
                // Make a copy to avoid potential mutation
                globalAggregatedItems.set(key, { ...itemData });
            }
        });
    });

    // Group and return
    const groupedList = _groupShoppingListItems(globalAggregatedItems);
    return groupedList;
};

// --- Optional: Direct Shopping List Updates ---

/**
 * Update shopping list details (top-level fields only)
 * @param listId Shopping list ID
 * @param data Update data
 * @param userId User ID for tracking
 * @returns Updated shopping list
 */
export const updateShoppingListDetails = async (
    listId: number,
    data: ValidatedUpdateShoppingListInput,
    userId?: string
): Promise<ShoppingListData> => {
    if (!listId || isNaN(listId) || listId <= 0) {
        throw new AppError(`Invalid shopping list ID: ${ listId }`, HttpStatus.BAD_REQUEST);
    }

    const updateData = addUpdateTracking(data, userId);

    const updatedList = await prisma.shoppingList.update({
        where: { id: listId },
        data: updateData,
        include: {
            event: {
                select: { eventName: true }
            }
        }
    });

    return {
        ...updatedList,
        eventName: updatedList.event?.eventName
    } as unknown as ShoppingListData;
};