import { z } from 'zod';
import { StorageType } from '@prisma/client';

// Schema for creating a new ingredient
export const createIngredientSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional().nullable(),
    categoryId: z.number().int().positive('Category ID must be a positive integer'),
    subcategoryId: z.number().int().positive('Subcategory ID must be a positive integer').optional().nullable(),
    defaultUnitId: z.number().int().positive('Default unit ID must be a positive integer'),
    isPerishable: z.boolean().optional(),
    storageType: z.nativeEnum(StorageType).optional(),
    shelfLifeDays: z.number().int().positive().optional().nullable(),
    storageInstructions: z.string().optional().nullable(),
    supplierInstructions: z.string().optional().nullable(),
    supplierNotes: z.string().optional().nullable(),
    preferredSupplier: z.string().optional().nullable(),
    orderLeadTimeDays: z.number().int().positive().optional().nullable(),
    costPerUnitDollars: z.number().positive().optional().nullable(),
    packageSize: z.number().positive().optional().nullable(),
    packageUnitId: z.number().int().positive().optional().nullable(),
    isLocal: z.boolean().optional(),
    isOrganic: z.boolean().optional(),
    isSeasonalItem: z.boolean().optional(),
    hasVariablePrice: z.boolean().optional(),
    isCommonAllergen: z.boolean().optional(),
    isSpecialOrder: z.boolean().optional()
});

// Schema for updating an ingredient
export const updateIngredientSchema = createIngredientSchema.partial();

// Schema for filtering ingredients
export const getIngredientsQuerySchema = z.object({
    categoryId: z.string().optional(),
    subcategoryId: z.string().optional(),
    isPerishable: z.string().optional(),
    storageType: z.nativeEnum(StorageType).optional(),
    isLocal: z.string().optional(),
    isOrganic: z.string().optional(),
    isSeasonalItem: z.string().optional(),
    isCommonAllergen: z.string().optional(),
    search: z.string().optional()
});

// Type definitions based on the schemas
export type CreateIngredientInput = z.infer<typeof createIngredientSchema>;
export type UpdateIngredientInput = z.infer<typeof updateIngredientSchema>;
export type IngredientFilters = z.infer<typeof getIngredientsQuerySchema>;