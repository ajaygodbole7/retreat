import { z } from 'zod';
import { StorageType } from '@prisma/client';

// Schema for creating a new ingredient
export const createIngredientSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    description: z.string().optional(),
    category_id: z.number().int().positive('Category ID must be a positive integer'),
    subcategory_id: z.number().int().positive('Subcategory ID must be a positive integer').optional(),
    default_unit_id: z.number().int().positive('Default unit ID must be a positive integer'),
    isPerishable: z.boolean().optional(),
    storageType: z.nativeEnum(StorageType).optional(),
    shelfLifeDays: z.number().int().positive().optional(),
    storageInstructions: z.string().optional(),
    supplierInstructions: z.string().optional(),
    supplierNotes: z.string().optional(),
    preferredSupplier: z.string().optional(),
    orderLeadTimeDays: z.number().int().positive().optional(),
    costPerUnitDollars: z.number().positive().optional(),
    packageSize: z.number().positive().optional(),
    package_unit_id: z.number().int().positive().optional(),
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