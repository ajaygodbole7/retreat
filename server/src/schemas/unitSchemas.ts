import { z } from 'zod';
import { MeasurementSystem, UnitType } from '@prisma/client';

// Schema for creating a new unit of measure
export const createUnitSchema = z.object({
    name: z.string().min(1, 'Name is required'),
    abbreviation: z.string().min(1, 'Abbreviation is required'),
    system: z.nativeEnum(MeasurementSystem),
    type: z.nativeEnum(UnitType),
    baseUnitId: z.number().int().positive().optional(),
    conversionFactor: z.number().positive().default(1.0),
    equivalentUnitId: z.number().int().positive().optional(),
    equivalentFactor: z.number().positive().optional()
});

// Schema for updating a unit of measure
export const updateUnitSchema = createUnitSchema.partial();

// Schema for unit conversion
export const unitConversionSchema = z.object({
    quantity: z.number().positive('Quantity must be positive'),
    fromUnitId: z.number().int().positive('From unit ID must be a positive integer'),
    toUnitId: z.number().int().positive('To unit ID must be a positive integer'),
    ingredientId: z.number().int().positive('Ingredient ID must be a positive integer').optional()
});

// Type definitions based on the schemas
export type CreateUnitInput = z.infer<typeof createUnitSchema>;
export type UpdateUnitInput = z.infer<typeof updateUnitSchema>;
export type UnitConversionInput = z.infer<typeof unitConversionSchema>;