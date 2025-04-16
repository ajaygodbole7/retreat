// server/src/schemas/scheduledMealSchemas.ts
import { z } from 'zod';
import { MealType } from '@prisma/client';

// --- ScheduledMeal Schemas ---
export const createScheduledMealSchema = z.object({
    // dayId will come from route parameter
    time: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)(?::([0-5]\d))?$/, "Invalid time format (HH:MM or HH:MM:SS)"), // Validate time string
    mealType: z.nativeEnum(MealType, { required_error: "Meal type is required" }),
    attendeeHeadcount: z.number().int().nonnegative().default(0),
    volunteerHeadcount: z.number().int().nonnegative().default(0),
    menuId: z.number().int().positive().optional().nullable(), // Optional link to a template
    notes: z.string().optional().nullable(),
});

export const updateScheduledMealSchema = createScheduledMealSchema.partial();

export type CreateScheduledMealInput = z.infer<typeof createScheduledMealSchema>;
export type UpdateScheduledMealInput = z.infer<typeof updateScheduledMealSchema>;

// --- ScheduledMealRecipe Schema ---
// Schema just needs the recipeId to link
export const scheduledMealRecipeSchema = z.object({
    recipeId: z.number().int().positive('Valid Recipe ID is required'),
    // displayOrder might be useful here too, if order matters within a meal
    // displayOrder: z.number().int().nonnegative().optional().default(0),
});

export type ScheduledMealRecipeInput = z.infer<typeof scheduledMealRecipeSchema>;