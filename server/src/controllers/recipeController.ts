import { Request, Response, NextFunction } from "express";
import prisma from "../lib/prisma";
import { AppError } from "../middleware/errorHandler";
import {
    CreateRecipeInput,
    UpdateRecipeInput,
    RecipeFilters,
    CreateRecipeStepInput,
    UpdateRecipeStepInput,
    CreateRecipeIngredientInput,
    UpdateRecipeIngredientInput
} from "../types/recipe-types";
import {
    addCreationTracking,
    addUpdateTracking,
    getCurrentUserId
} from "../utils/whoUtils";

/**
 * Get all recipes with optional filtering
 */
export const getAllRecipes = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const filters = req.query as unknown as RecipeFilters;

        // Build filter conditions
        const where: any = {};

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

        // Add createdBy filter support
        if (filters.createdBy) {
            where.createdBy = { equals: filters.createdBy, mode: 'insensitive' };
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

        res.json(recipes);
    } catch (error) {
        next(error);
    }
};

/**
 * Get a single recipe by ID with detailed information
 */
export const getRecipeById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        const recipe = await prisma.recipe.findUnique({
            where: { id: parseInt(id) },
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
            throw new AppError('Recipe not found', 404);
        }

        res.json(recipe);
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new recipe
 */
export const createRecipe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Get the base recipe data from the request
        const baseRecipeData: CreateRecipeInput = req.body;

        // Ensure baseRecipeData is an object (type constraint)
        const recipeDataObj = { ...baseRecipeData };

        // Get the current user and add tracking fields
        const userId = getCurrentUserId(req);
        const recipeData = addCreationTracking(recipeDataObj, userId);

        // Create the recipe with tracking fields
        const recipe = await prisma.recipe.create({
            data: recipeData
        });

        res.status(201).json(recipe);
    } catch (error) {
        next(error);
    }
};

/**
 * Update an existing recipe
 */
export const updateRecipe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        // Get the base update data from the request
        const baseUpdateData: UpdateRecipeInput = req.body;

        // Ensure baseUpdateData is an object (type constraint)
        const updateDataObj = { ...baseUpdateData };

        // Get the current user and add tracking fields
        const userId = getCurrentUserId(req);
        const updateData = addUpdateTracking(updateDataObj, userId);

        // Update the recipe
        const recipe = await prisma.recipe.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        res.json(recipe);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a recipe
 */
export const deleteRecipe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        // Check if the recipe exists
        const recipe = await prisma.recipe.findUnique({
            where: { id: parseInt(id) }
        });

        if (!recipe) {
            throw new AppError('Recipe not found', 404);
        }

        // Delete the recipe - this will cascade delete steps and ingredients
        await prisma.recipe.delete({
            where: { id: parseInt(id) }
        });

        res.json({
            message: "Recipe deleted successfully",
            deletedBy: getCurrentUserId(req)
        });
    } catch (error) {
        next(error);
    }
};

// Recipe Step Controllers

/**
 * Get all steps for a recipe
 */
export const getRecipeSteps = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { recipeId } = req.params;

        const steps = await prisma.recipeStep.findMany({
            where: { recipeId: parseInt(recipeId) },
            orderBy: { stepNumber: 'asc' }
        });

        res.json(steps);
    } catch (error) {
        next(error);
    }
};

/**
 * Get a single recipe step by ID
 */
export const getRecipeStepById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        const step = await prisma.recipeStep.findUnique({
            where: { id: parseInt(id) }
        });

        if (!step) {
            throw new AppError('Recipe step not found', 404);
        }

        res.json(step);
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new recipe step
 */
export const createRecipeStep = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Get the base step data from the request
        const baseStepData: CreateRecipeStepInput = req.body;

        // Ensure baseStepData is an object (type constraint)
        const stepDataObj = { ...baseStepData };

        // Get the current user and add tracking fields
        const userId = getCurrentUserId(req);
        const stepData = addCreationTracking(stepDataObj, userId);

        // Verify the recipe exists
        const recipe = await prisma.recipe.findUnique({
            where: { id: stepData.recipeId }
        });

        if (!recipe) {
            throw new AppError('Recipe not found', 404);
        }

        // Create the step with tracking fields
        const step = await prisma.recipeStep.create({
            data: stepData
        });

        res.status(201).json(step);
    } catch (error) {
        next(error);
    }
};

/**
 * Update an existing recipe step
 */
export const updateRecipeStep = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        // Get the base update data from the request
        const baseUpdateData: UpdateRecipeStepInput = req.body;

        // Ensure baseUpdateData is an object (type constraint)
        const updateDataObj = { ...baseUpdateData };

        // Get the current user and add tracking fields
        const userId = getCurrentUserId(req);
        const updateData = addUpdateTracking(updateDataObj, userId);

        // Update the step
        const step = await prisma.recipeStep.update({
            where: { id: parseInt(id) },
            data: updateData
        });

        res.json(step);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a recipe step
 */
export const deleteRecipeStep = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        // Check if the step exists
        const step = await prisma.recipeStep.findUnique({
            where: { id: parseInt(id) }
        });

        if (!step) {
            throw new AppError('Recipe step not found', 404);
        }

        // Delete the step
        await prisma.recipeStep.delete({
            where: { id: parseInt(id) }
        });

        res.json({
            message: "Recipe step deleted successfully",
            deletedBy: getCurrentUserId(req)
        });
    } catch (error) {
        next(error);
    }
};

// Recipe Ingredient Controllers

/**
 * Get all ingredients for a recipe
 */
export const getRecipeIngredients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { recipeId } = req.params;

        const ingredients = await prisma.recipeIngredient.findMany({
            where: { recipeId: parseInt(recipeId) },
            include: {
                ingredient: true,
                unit: true,
                alternateIngredient: true
            },
            orderBy: { displayOrder: 'asc' }
        });

        res.json(ingredients);
    } catch (error) {
        next(error);
    }
};

/**
 * Get a single recipe ingredient by ID
 */
export const getRecipeIngredientById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        const ingredient = await prisma.recipeIngredient.findUnique({
            where: { id: parseInt(id) },
            include: {
                ingredient: true,
                unit: true,
                alternateIngredient: true
            }
        });

        if (!ingredient) {
            throw new AppError('Recipe ingredient not found', 404);
        }

        res.json(ingredient);
    } catch (error) {
        next(error);
    }
};

/**
 * Create a new recipe ingredient
 */
export const createRecipeIngredient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        // Get the base ingredient data from the request
        const baseIngredientData: CreateRecipeIngredientInput = req.body;

        // Ensure baseIngredientData is an object (type constraint)
        const ingredientDataObj = { ...baseIngredientData };

        // Get the current user and add tracking fields
        const userId = getCurrentUserId(req);
        const ingredientData = addCreationTracking(ingredientDataObj, userId);

        // Verify the recipe exists
        const recipe = await prisma.recipe.findUnique({
            where: { id: ingredientData.recipeId }
        });

        if (!recipe) {
            throw new AppError('Recipe not found', 404);
        }

        // Verify the ingredient exists
        const ingredient = await prisma.ingredient.findUnique({
            where: { id: ingredientData.ingredientId }
        });

        if (!ingredient) {
            throw new AppError('Ingredient not found', 404);
        }

        // Verify the unit exists
        const unit = await prisma.unitOfMeasure.findUnique({
            where: { id: ingredientData.unitId }
        });

        if (!unit) {
            throw new AppError('Unit not found', 404);
        }

        // Verify the alternate ingredient exists if provided
        if (ingredientData.alternateIngredientId) {
            const alternateIngredient = await prisma.ingredient.findUnique({
                where: { id: ingredientData.alternateIngredientId }
            });

            if (!alternateIngredient) {
                throw new AppError('Alternate ingredient not found', 404);
            }
        }

        // Create the recipe ingredient with tracking fields
        const recipeIngredient = await prisma.recipeIngredient.create({
            data: ingredientData,
            include: {
                ingredient: true,
                unit: true,
                alternateIngredient: true
            }
        });

        res.status(201).json(recipeIngredient);
    } catch (error) {
        next(error);
    }
};

/**
 * Update an existing recipe ingredient
 */
export const updateRecipeIngredient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        // Get the base update data from the request
        const baseUpdateData: UpdateRecipeIngredientInput = req.body;

        // Ensure baseUpdateData is an object (type constraint)
        const updateDataObj = { ...baseUpdateData };

        // Get the current user and add tracking fields
        const userId = getCurrentUserId(req);
        const updateData = addUpdateTracking(updateDataObj, userId);

        // Verify the unit exists if provided
        if (updateData.unitId) {
            const unit = await prisma.unitOfMeasure.findUnique({
                where: { id: updateData.unitId }
            });

            if (!unit) {
                throw new AppError('Unit not found', 404);
            }
        }

        // Verify the alternate ingredient exists if provided
        if (updateData.alternateIngredientId) {
            const alternateIngredient = await prisma.ingredient.findUnique({
                where: { id: updateData.alternateIngredientId }
            });

            if (!alternateIngredient) {
                throw new AppError('Alternate ingredient not found', 404);
            }
        }

        // Update the recipe ingredient
        const recipeIngredient = await prisma.recipeIngredient.update({
            where: { id: parseInt(id) },
            data: updateData,
            include: {
                ingredient: true,
                unit: true,
                alternateIngredient: true
            }
        });

        res.json(recipeIngredient);
    } catch (error) {
        next(error);
    }
};

/**
 * Delete a recipe ingredient
 */
export const deleteRecipeIngredient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params;

        // Check if the recipe ingredient exists
        const recipeIngredient = await prisma.recipeIngredient.findUnique({
            where: { id: parseInt(id) }
        });

        if (!recipeIngredient) {
            throw new AppError('Recipe ingredient not found', 404);
        }

        // Delete the recipe ingredient
        await prisma.recipeIngredient.delete({
            where: { id: parseInt(id) }
        });

        res.json({
            message: "Recipe ingredient deleted successfully",
            deletedBy: getCurrentUserId(req)
        });
    } catch (error) {
        next(error);
    }
};