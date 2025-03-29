/**
 * RecipeController.ts - Handles HTTP requests for recipe operations
 */
import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";
import {
    createRecipeSchema,
    updateRecipeSchema,
    getRecipesQuerySchema,
    createRecipeStepSchema,
    updateRecipeStepSchema,
    createRecipeIngredientSchema,
    updateRecipeIngredientSchema,
    createCompleteRecipeSchema,
    updateCompleteRecipeSchema,
    scaleRecipeQuerySchema,
    /*
        // Types from schema
        CreateRecipeInput,
        UpdateRecipeInput,
        RecipeFilters,
        CreateRecipeStepInput,
        UpdateRecipeStepInput,
        CreateRecipeIngredientInput,
        UpdateRecipeIngredientInput
        */
} from "../schemas/recipeSchemas";
import { HttpStatus } from "../constants/httpStatus";
import { AppError } from "../middleware/errorHandler";
import { addCreationTracking, addUpdateTracking, getCurrentUserId } from "../utils/whoUtils";
import { scaleRecipe } from "../services/recipeScalingService";
import { parseBody, parseQuery, parseIdParam } from "../utils/validateRequestUtils";

/**
 * Get all recipes with optional filtering
 */
export const getAllRecipes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Use utility to parse and validate query parameters
        const filters = parseQuery(req, getRecipesQuerySchema);

        // Build filter conditions
        const where: Record<string, unknown> = {};

        if (filters.courseType) {
            where.courseType = filters.courseType;
        }

        if (filters.isVegan !== undefined) {
            where.isVegan = filters.isVegan === 'true';
        }

        if (filters.isGlutenFree !== undefined) {
            where.isGlutenFree = filters.isGlutenFree === 'true';
        }

        if (filters.hasOnionGarlic !== undefined) {
            where.hasOnionGarlic = filters.hasOnionGarlic === 'true';
        }

        if (filters.submittedBy) {
            where.submittedBy = { contains: filters.submittedBy, mode: 'insensitive' };
        }

        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } },
                { tags: { contains: filters.search, mode: 'insensitive' } }
            ];
        }

        const recipes = await prisma.recipe.findMany({
            where,
            include: {
                _count: {
                    select: {
                        steps: true,
                        recipeIngredients: true
                    }
                }
            },
            orderBy: { name: 'asc' },
        });

        res.status(HttpStatus.OK).json(recipes);
    } catch (error) {
        next(error);
    }
};

/**
 * Get a single recipe by ID with detailed information
 */
export const getRecipeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const recipeId = parseIdParam(req, 'id', 'Invalid recipe ID');

        const recipe = await prisma.recipe.findUnique({
            where: { id: recipeId },
            include: {
                steps: {
                    orderBy: { stepNumber: 'asc' }
                },
                recipeIngredients: {
                    include: {
                        ingredient: true,
                        unit: true,
                        alternateIngredient: true
                    },
                    orderBy: { displayOrder: 'asc' }
                }
            },
        });

        if (!recipe) {
            throw new AppError('Recipe not found', HttpStatus.NOT_FOUND);
        }

        res.status(HttpStatus.OK).json(recipe);
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new recipe
 */
export const createRecipe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Use utility to validate input with Zod
        const data = parseBody(req, createRecipeSchema);

        // Add tracking fields
        const userId = getCurrentUserId(req);
        const recipeData = addCreationTracking(data, userId);

        // Create recipe with transaction
        const recipe = await prisma.$transaction(async (tx) => {
            return tx.recipe.create({
                data: recipeData
            });
        });

        res.status(HttpStatus.CREATED).json(recipe);
    } catch (error) {
        next(error);
    }
};

/**
 * Update an existing recipe
 */
export const updateRecipe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const recipeId = parseIdParam(req, 'id', 'Invalid recipe ID');

        // Use utility to validate input with Zod
        const updateData = parseBody(req, updateRecipeSchema);

        // Add tracking fields
        const userId = getCurrentUserId(req);
        const recipeUpdateData = addUpdateTracking(updateData, userId);

        // Update recipe with transaction
        const recipe = await prisma.$transaction(async (tx) => {
            // Check if recipe exists
            const existingRecipe = await tx.recipe.findUnique({
                where: { id: recipeId }
            });

            if (!existingRecipe) {
                throw new AppError('Recipe not found', HttpStatus.NOT_FOUND);
            }

            return tx.recipe.update({
                where: { id: recipeId },
                data: recipeUpdateData
            });
        });

        res.status(HttpStatus.OK).json(recipe);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a recipe
 */
export const deleteRecipe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const recipeId = parseIdParam(req, 'id', 'Invalid recipe ID');

        // Delete recipe with transaction
        await prisma.$transaction(async (tx) => {
            // Check if recipe exists
            const recipe = await tx.recipe.findUnique({
                where: { id: recipeId }
            });

            if (!recipe) {
                throw new AppError('Recipe not found', HttpStatus.NOT_FOUND);
            }

            // Delete related records
            await tx.recipeStep.deleteMany({
                where: { recipeId }
            });

            await tx.recipeIngredient.deleteMany({
                where: { recipeId }
            });

            // Delete the recipe
            await tx.recipe.delete({
                where: { id: recipeId }
            });
        });

        res.status(HttpStatus.OK).json({
            message: "Recipe deleted successfully",
            deletedBy: getCurrentUserId(req)
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Scale a recipe to a target number of servings
 */
export const scaleRecipeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const recipeId = parseIdParam(req, 'id', 'Invalid recipe ID');

        // Validate query parameters using utility
        const { targetServingSize } = parseQuery(req, scaleRecipeQuerySchema);

        // Convert to number
        const numericTargetSize = Number(targetServingSize);

        // Get recipe with related data
        const recipe = await prisma.recipe.findUnique({
            where: { id: recipeId },
            include: {
                steps: {
                    orderBy: { stepNumber: "asc" },
                },
                recipeIngredients: {
                    include: {
                        ingredient: true,
                        unit: true,
                        alternateIngredient: true,
                    },
                    orderBy: { displayOrder: "asc" },
                },
            },
        });

        if (!recipe) {
            throw new AppError("Recipe not found", HttpStatus.NOT_FOUND);
        }

        // Scale the recipe
        const scaledRecipe = scaleRecipe(recipe, numericTargetSize);

        res.status(HttpStatus.OK).json(scaledRecipe);
    } catch (error) {
        next(error);
    }
};

/**
 * Get all steps for a recipe
 */
export const getRecipeSteps = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const recipeId = parseIdParam(req, 'recipeId', 'Invalid recipe ID');

        const steps = await prisma.recipeStep.findMany({
            where: { recipeId },
            orderBy: { stepNumber: 'asc' }
        });

        res.status(HttpStatus.OK).json(steps);
    } catch (error) {
        next(error);
    }
};

/**
 * Get a single recipe step by ID
 */
export const getRecipeStepById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const stepId = parseIdParam(req, 'id', 'Invalid step ID');

        const step = await prisma.recipeStep.findUnique({
            where: { id: stepId }
        });

        if (!step) {
            throw new AppError('Recipe step not found', HttpStatus.NOT_FOUND);
        }

        res.status(HttpStatus.OK).json(step);
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new recipe step
 */
export const createRecipeStep = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Validate input with Zod
        const stepData = parseBody(req, createRecipeStepSchema);

        // Add tracking fields
        const userId = getCurrentUserId(req);
        const trackedStepData = addCreationTracking(stepData, userId);

        // Create step with transaction
        const step = await prisma.$transaction(async (tx) => {
            // Verify the recipe exists
            const recipe = await tx.recipe.findUnique({
                where: { id: trackedStepData.recipeId }
            });

            if (!recipe) {
                throw new AppError('Recipe not found', HttpStatus.NOT_FOUND);
            }

            // Create the step
            return tx.recipeStep.create({
                data: trackedStepData
            });
        });

        res.status(HttpStatus.CREATED).json(step);
    } catch (error) {
        next(error);
    }
};

/**
 * Update an existing recipe step
 */
export const updateRecipeStep = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const stepId = parseIdParam(req, 'id', 'Invalid step ID');

        // Validate input with Zod
        const updateData = parseBody(req, updateRecipeStepSchema);

        // Add tracking fields
        const userId = getCurrentUserId(req);
        const trackedUpdateData = addUpdateTracking(updateData, userId);

        // Update step with transaction
        const step = await prisma.$transaction(async (tx) => {
            // Check if step exists
            const existingStep = await tx.recipeStep.findUnique({
                where: { id: stepId }
            });

            if (!existingStep) {
                throw new AppError('Recipe step not found', HttpStatus.NOT_FOUND);
            }

            // Update the step
            return tx.recipeStep.update({
                where: { id: stepId },
                data: trackedUpdateData
            });
        });

        res.status(HttpStatus.OK).json(step);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a recipe step
 */
export const deleteRecipeStep = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const stepId = parseIdParam(req, 'id', 'Invalid step ID');

        // Delete step with transaction
        await prisma.$transaction(async (tx) => {
            // Check if step exists
            const step = await tx.recipeStep.findUnique({
                where: { id: stepId }
            });

            if (!step) {
                throw new AppError('Recipe step not found', HttpStatus.NOT_FOUND);
            }

            // Delete the step
            await tx.recipeStep.delete({
                where: { id: stepId }
            });
        });

        res.status(HttpStatus.OK).json({
            message: "Recipe step deleted successfully",
            deletedBy: getCurrentUserId(req)
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Get all ingredients for a recipe
 */
export const getRecipeIngredients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const recipeId = parseIdParam(req, 'recipeId', 'Invalid recipe ID');

        const ingredients = await prisma.recipeIngredient.findMany({
            where: { recipeId },
            include: {
                ingredient: true,
                unit: true,
                alternateIngredient: true
            },
            orderBy: { displayOrder: 'asc' }
        });

        res.status(HttpStatus.OK).json(ingredients);
    } catch (error) {
        next(error);
    }
};

/**
 * Get a single recipe ingredient by ID
 */
export const getRecipeIngredientById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const ingredientId = parseIdParam(req, 'id', 'Invalid ingredient ID');

        const ingredient = await prisma.recipeIngredient.findUnique({
            where: { id: ingredientId },
            include: {
                ingredient: true,
                unit: true,
                alternateIngredient: true
            }
        });

        if (!ingredient) {
            throw new AppError('Recipe ingredient not found', HttpStatus.NOT_FOUND);
        }

        res.status(HttpStatus.OK).json(ingredient);
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new recipe ingredient
 */
export const createRecipeIngredient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Validate input with Zod
        const ingredientData = parseBody(req, createRecipeIngredientSchema);

        // Add tracking fields
        const userId = getCurrentUserId(req);
        const trackedIngredientData = addCreationTracking(ingredientData, userId);

        // Create ingredient with transaction
        const recipeIngredient = await prisma.$transaction(async (tx) => {
            // Verify the recipe exists
            const recipe = await tx.recipe.findUnique({
                where: { id: trackedIngredientData.recipeId }
            });

            if (!recipe) {
                throw new AppError('Recipe not found', HttpStatus.NOT_FOUND);
            }

            // Verify the ingredient exists
            const ingredient = await tx.ingredient.findUnique({
                where: { id: trackedIngredientData.ingredientId }
            });

            if (!ingredient) {
                throw new AppError('Ingredient not found', HttpStatus.NOT_FOUND);
            }

            // Verify the unit exists
            const unit = await tx.unitOfMeasure.findUnique({
                where: { id: trackedIngredientData.unitId }
            });

            if (!unit) {
                throw new AppError('Unit not found', HttpStatus.NOT_FOUND);
            }

            // Verify the alternate ingredient exists if provided
            if (trackedIngredientData.alternateIngredientId) {
                const alternateIngredient = await tx.ingredient.findUnique({
                    where: { id: trackedIngredientData.alternateIngredientId }
                });

                if (!alternateIngredient) {
                    throw new AppError('Alternate ingredient not found', HttpStatus.NOT_FOUND);
                }
            }

            // Create the recipe ingredient
            return tx.recipeIngredient.create({
                data: trackedIngredientData,
                include: {
                    ingredient: true,
                    unit: true,
                    alternateIngredient: true
                }
            });
        });

        res.status(HttpStatus.CREATED).json(recipeIngredient);
    } catch (error) {
        next(error);
    }
};

/**
 * Update an existing recipe ingredient
 */
export const updateRecipeIngredient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const ingredientId = parseIdParam(req, 'id', 'Invalid ingredient ID');

        // Validate input with Zod
        const updateData = parseBody(req, updateRecipeIngredientSchema);

        // Add tracking fields
        const userId = getCurrentUserId(req);
        const trackedUpdateData = addUpdateTracking(updateData, userId);

        // Update ingredient with transaction
        const recipeIngredient = await prisma.$transaction(async (tx) => {
            // Check if recipe ingredient exists
            const existingIngredient = await tx.recipeIngredient.findUnique({
                where: { id: ingredientId }
            });

            if (!existingIngredient) {
                throw new AppError('Recipe ingredient not found', HttpStatus.NOT_FOUND);
            }

            // Verify the unit exists if provided
            if (trackedUpdateData.unitId) {
                const unit = await tx.unitOfMeasure.findUnique({
                    where: { id: trackedUpdateData.unitId }
                });

                if (!unit) {
                    throw new AppError('Unit not found', HttpStatus.NOT_FOUND);
                }
            }

            // Verify the alternate ingredient exists if provided
            if (trackedUpdateData.alternateIngredientId) {
                const alternateIngredient = await tx.ingredient.findUnique({
                    where: { id: trackedUpdateData.alternateIngredientId }
                });

                if (!alternateIngredient) {
                    throw new AppError('Alternate ingredient not found', HttpStatus.NOT_FOUND);
                }
            }

            // Update the recipe ingredient
            return tx.recipeIngredient.update({
                where: { id: ingredientId },
                data: trackedUpdateData,
                include: {
                    ingredient: true,
                    unit: true,
                    alternateIngredient: true
                }
            });
        });

        res.status(HttpStatus.OK).json(recipeIngredient);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a recipe ingredient
 */
export const deleteRecipeIngredient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const ingredientId = parseIdParam(req, 'id', 'Invalid ingredient ID');

        // Delete ingredient with transaction
        await prisma.$transaction(async (tx) => {
            // Check if recipe ingredient exists
            const recipeIngredient = await tx.recipeIngredient.findUnique({
                where: { id: ingredientId }
            });

            if (!recipeIngredient) {
                throw new AppError('Recipe ingredient not found', HttpStatus.NOT_FOUND);
            }

            // Delete the recipe ingredient
            await tx.recipeIngredient.delete({
                where: { id: ingredientId }
            });
        });

        res.status(HttpStatus.OK).json({
            message: "Recipe ingredient deleted successfully",
            deletedBy: getCurrentUserId(req)
        });
    } catch (error) {
        next(error);
    }
};

/**
 * Create a complete recipe with ingredients and steps in one operation
 */
export const createCompleteRecipe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Validate all inputs using Zod
        const { recipe, ingredients, steps } = parseBody(req, createCompleteRecipeSchema);

        // Get user ID for tracking
        const userId = getCurrentUserId(req);

        // Add tracking to recipe data
        const recipeData = addCreationTracking(recipe, userId);

        // Create complete recipe with transaction
        const result = await prisma.$transaction(async (tx) => {
            // 1. Create the recipe
            const createdRecipe = await tx.recipe.create({
                data: recipeData,
            });

            // 2. Create ingredients if provided
            if (ingredients && ingredients.length > 0) {
                // Verify all referenced entities exist before creating ingredients
                for (const ingredient of ingredients) {
                    // Verify ingredient exists
                    const existingIngredient = await tx.ingredient.findUnique({
                        where: { id: ingredient.ingredientId }
                    });

                    if (!existingIngredient) {
                        throw new AppError(`Ingredient with ID ${ingredient.ingredientId} not found`, HttpStatus.NOT_FOUND);
                    }

                    // Verify unit exists
                    const existingUnit = await tx.unitOfMeasure.findUnique({
                        where: { id: ingredient.unitId }
                    });

                    if (!existingUnit) {
                        throw new AppError(`Unit with ID ${ingredient.unitId} not found`, HttpStatus.NOT_FOUND);
                    }

                    // Verify alternate ingredient if provided
                    if (ingredient.alternateIngredientId) {
                        const alternateIngredient = await tx.ingredient.findUnique({
                            where: { id: ingredient.alternateIngredientId }
                        });

                        if (!alternateIngredient) {
                            throw new AppError(`Alternate ingredient with ID ${ingredient.alternateIngredientId} not found`, HttpStatus.NOT_FOUND);
                        }
                    }
                }

                // Create all ingredients with tracking data
                await Promise.all(ingredients.map(ingredient => {
                    const ingredientData = addCreationTracking({
                        ...ingredient,
                        recipeId: createdRecipe.id
                    }, userId);

                    return tx.recipeIngredient.create({
                        data: ingredientData
                    });
                }));
            }

            // 3. Create steps if provided
            if (steps && steps.length > 0) {
                // Create all steps with tracking data
                await Promise.all(steps.map(step => {
                    const stepData = addCreationTracking({
                        ...step,
                        recipeId: createdRecipe.id
                    }, userId);

                    return tx.recipeStep.create({
                        data: stepData
                    });
                }));
            }

            // Return complete recipe with relations
            return tx.recipe.findUnique({
                where: { id: createdRecipe.id },
                include: {
                    steps: {
                        orderBy: { stepNumber: "asc" },
                    },
                    recipeIngredients: {
                        include: {
                            ingredient: true,
                            unit: true,
                            alternateIngredient: true,
                        },
                        orderBy: { displayOrder: "asc" },
                    },
                },
            });
        });

        res.status(HttpStatus.CREATED).json(result);
    } catch (error) {
        next(error);
    }
};

/**
 * Update a complete recipe with ingredients and steps in one operation
 */
export const updateCompleteRecipe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const recipeId = parseIdParam(req, 'id', 'Invalid recipe ID');

        // Validate input with Zod
        const { recipe, ingredients, steps } = parseBody(req, updateCompleteRecipeSchema);

        // Get user ID for tracking
        const userId = getCurrentUserId(req);

        // Add tracking to recipe data
        const recipeData = addUpdateTracking(recipe, userId);

        // Update complete recipe with transaction
        const result = await prisma.$transaction(async (tx) => {
            // First verify recipe exists
            const existingRecipe = await tx.recipe.findUnique({
                where: { id: recipeId }
            });

            if (!existingRecipe) {
                throw new AppError(`Recipe with ID ${recipeId} not found`, HttpStatus.NOT_FOUND);
            }

            // 1. Update the recipe
            await tx.recipe.update({
                where: { id: recipeId },
                data: recipeData,
            });

            // 2. Handle ingredients
            if (ingredients) {
                // Get existing ingredients to determine which ones to delete
                const existingIngredients = await tx.recipeIngredient.findMany({
                    where: { recipeId },
                });

                // Create a map of existing ingredient IDs
                const existingIngredientIds = new Set(existingIngredients.map((ing) => ing.id));

                // Track which IDs we're keeping
                const keepIngredientIds = new Set<number>();

                // Process each ingredient from the request
                for (const ingredient of ingredients) {
                    // Verify referenced entities exist
                    const ingredientExists = await tx.ingredient.findUnique({
                        where: { id: ingredient.ingredientId }
                    });

                    if (!ingredientExists) {
                        throw new AppError(`Ingredient with ID ${ingredient.ingredientId} not found`, HttpStatus.NOT_FOUND);
                    }

                    const unitExists = await tx.unitOfMeasure.findUnique({
                        where: { id: ingredient.unitId }
                    });

                    if (!unitExists) {
                        throw new AppError(`Unit with ID ${ingredient.unitId} not found`, HttpStatus.NOT_FOUND);
                    }

                    if (ingredient.alternateIngredientId) {
                        const alternateExists = await tx.ingredient.findUnique({
                            where: { id: ingredient.alternateIngredientId }
                        });

                        if (!alternateExists) {
                            throw new AppError(`Alternate ingredient with ID ${ingredient.alternateIngredientId} not found`, HttpStatus.NOT_FOUND);
                        }
                    }

                    if (ingredient.id) {
                        // This is an existing ingredient - update it
                        keepIngredientIds.add(ingredient.id);

                        // Create a clean copy of update data
                        const { id, ...updateFields } = ingredient;
                        const ingredientUpdateData = addUpdateTracking(updateFields, userId);

                        await tx.recipeIngredient.update({
                            where: { id },
                            data: ingredientUpdateData,
                        });
                    } else {
                        // This is a new ingredient - create it
                        const ingredientData = addCreationTracking({
                            ...ingredient,
                            recipeId
                        }, userId);

                        await tx.recipeIngredient.create({
                            data: ingredientData,
                        });
                    }
                }

                // Delete ingredients that weren't included in the update
                for (const id of existingIngredientIds) {
                    if (!keepIngredientIds.has(id)) {
                        await tx.recipeIngredient.delete({
                            where: { id },
                        });
                    }
                }
            }

            // 3. Handle steps
            if (steps) {
                // Get existing steps to determine which ones to delete
                const existingSteps = await tx.recipeStep.findMany({
                    where: { recipeId },
                });

                // Create a map of existing step IDs
                const existingStepIds = new Set(existingSteps.map((step) => step.id));

                // Track which IDs we're keeping
                const keepStepIds = new Set<number>();

                // Process each step from the request
                for (const step of steps) {
                    if (step.id) {
                        // This is an existing step - update it
                        keepStepIds.add(step.id);

                        const { id, ...updateFields } = step;
                        const stepUpdateData = addUpdateTracking(updateFields, userId);

                        await tx.recipeStep.update({
                            where: { id },
                            data: stepUpdateData,
                        });
                    } else {
                        // This is a new step - create it
                        const stepData = addCreationTracking({
                            ...step,
                            recipeId,
                        }, userId);

                        await tx.recipeStep.create({
                            data: stepData,
                        });
                    }
                }

                // Delete steps that weren't included in the update
                for (const id of existingStepIds) {
                    if (!keepStepIds.has(id)) {
                        await tx.recipeStep.delete({
                            where: { id },
                        });
                    }
                }
            }

            // Return the updated recipe with its relations
            return tx.recipe.findUnique({
                where: { id: recipeId },
                include: {
                    steps: {
                        orderBy: { stepNumber: "asc" },
                    },
                    recipeIngredients: {
                        include: {
                            ingredient: true,
                            unit: true,
                            alternateIngredient: true,
                        },
                        orderBy: { displayOrder: "asc" },
                    },
                },
            });
        });

        res.status(HttpStatus.OK).json(result);
    } catch (error) {
        next(error);
    }
};