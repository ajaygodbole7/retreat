import { z } from 'zod';

// Schema for creating a new category
export const createCategorySchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    storeSection: z.string().optional(),
    displayOrder: z.number().int().nonnegative().optional()
});

// Schema for updating a category
export const updateCategorySchema = createCategorySchema.partial();

// Schema for creating a new subcategory
export const createSubcategorySchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    displayOrder: z.number().int().nonnegative().optional()
});

// Schema for updating a subcategory
export const updateSubcategorySchema = createSubcategorySchema.partial();

// Type definitions based on the schemas
export type CreateCategoryInput = z.infer<typeof createCategorySchema>;
export type UpdateCategoryInput = z.infer<typeof updateCategorySchema>;
export type CreateSubcategoryInput = z.infer<typeof createSubcategorySchema>;
export type UpdateSubcategoryInput = z.infer<typeof updateSubcategorySchema>;