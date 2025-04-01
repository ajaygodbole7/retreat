// server/src/schemas/menuSchemas.ts
import { z } from 'zod';
import { MealType } from '@prisma/client';

// --- Menu Schemas ---
export const createMenuSchema = z.object({
    name: z.string().min(1, 'Menu name is required'),
    description: z.string().optional().nullable(),
    mealType: z.nativeEnum(MealType).optional().nullable(),
});

export const updateMenuSchema = createMenuSchema.partial();

export type CreateMenuInput = z.infer<typeof createMenuSchema>;
export type UpdateMenuInput = z.infer<typeof updateMenuSchema>;

// --- MenuRecipe Schemas ---
// Schema for adding/updating a recipe WITHIN a menu
export const menuRecipeSchema = z.object({
    recipeId: z.number().int().positive('Valid Recipe ID is required'),
    displayOrder: z.number().int().nonnegative().optional().default(0),
    // courseType: z.nativeEnum(CourseType).default(CourseType.MAIN_COURSE), // Removed based on discussion
    // notes: z.string().optional().nullable(), // Removed based on discussion
});

export type MenuRecipeInput = z.infer<typeof menuRecipeSchema>;