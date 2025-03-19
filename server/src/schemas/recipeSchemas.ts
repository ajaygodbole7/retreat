import { z } from 'zod';
import { CourseType, CookingMethod } from '@prisma/client';

// Schema for creating a new recipe
export const createRecipeSchema = z.object({
    name: z.string().min(1, 'Recipe name is required'),
    description: z.string().optional().nullable(),
    servingSize: z.number().int().positive().default(8),
    preparationTimeMinutes: z.number().int().positive().optional().nullable(),
    cookingTimeMinutes: z.number().int().positive().optional().nullable(),
    totalTimeMinutes: z.number().int().positive().optional().nullable(),
    notes: z.string().optional().nullable(),
    cookingMethod: z.nativeEnum(CookingMethod).optional().nullable(),
    cookingEquipment: z.string().optional().nullable(),
    hasOnionGarlic: z.boolean().default(true),
    isGlutenFree: z.boolean().default(false),
    isVegan: z.boolean().default(false),
    courseType: z.nativeEnum(CourseType).default('MAIN_COURSE'),
    tags: z.string().optional().nullable(),
    submittedBy: z.string().optional().nullable(),
    createdBy: z.string().optional().nullable(),
});

// Schema for updating a recipe
export const updateRecipeSchema = createRecipeSchema.partial();

// Schema for filtering recipes
export const getRecipesQuerySchema = z.object({
    courseType: z.nativeEnum(CourseType).optional(),
    isVegan: z.string().optional(),
    isGlutenFree: z.string().optional(),
    hasOnionGarlic: z.string().optional(),
    submittedBy: z.string().optional(),
    search: z.string().optional()
});

// Schema for creating a new recipe step
export const createRecipeStepSchema = z.object({
    recipeId: z.number().int().positive('Recipe ID must be a positive integer'),
    stepNumber: z.number().int().nonnegative('Step number must be a non-negative integer'),
    instruction: z.string().min(1, 'Instruction is required'),
    estimatedTimeMinutes: z.number().int().positive().optional().nullable(),
    isOptional: z.boolean().default(false),
    createdBy: z.string().optional().nullable(),
});

// Schema for updating a recipe step
export const updateRecipeStepSchema = createRecipeStepSchema.omit({ recipeId: true }).partial();

// Schema for creating a new recipe ingredient
export const createRecipeIngredientSchema = z.object({
    recipeId: z.number().int().positive('Recipe ID must be a positive integer'),
    ingredientId: z.number().int().positive('Ingredient ID must be a positive integer'),
    quantity: z.number().positive('Quantity must be a positive number'),
    unitId: z.number().int().positive('Unit ID must be a positive integer'),
    preparation: z.string().optional().nullable(),
    isOptional: z.boolean().default(false),
    displayOrder: z.number().int().nonnegative().default(0),
    notes: z.string().optional().nullable(),
    scalingFactor: z.number().positive().default(1.0),
    alternateIngredientId: z.number().int().positive().optional().nullable(),
    createdBy: z.string().optional().nullable(),
});

// Schema for updating a recipe ingredient
export const updateRecipeIngredientSchema = createRecipeIngredientSchema
    .omit({ recipeId: true, ingredientId: true })
    .partial();

// Type definitions based on the schemas
export type CreateRecipeInput = z.infer<typeof createRecipeSchema>;
export type UpdateRecipeInput = z.infer<typeof updateRecipeSchema>;
export type RecipeFilters = z.infer<typeof getRecipesQuerySchema>;
export type CreateRecipeStepInput = z.infer<typeof createRecipeStepSchema>;
export type UpdateRecipeStepInput = z.infer<typeof updateRecipeStepSchema>;
export type CreateRecipeIngredientInput = z.infer<typeof createRecipeIngredientSchema>;
export type UpdateRecipeIngredientInput = z.infer<typeof updateRecipeIngredientSchema>;