import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';
import { AppError } from '../middleware/errorHandler';
import {
    CreateUnitInput,
    UpdateUnitInput,
    UnitConversionInput
} from '../schemas/unitSchemas';

export const getUnits = async (
    _req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const units = await prisma.unitOfMeasure.findMany({
            orderBy: [
                { system: 'asc' },
                { type: 'asc' },
                { name: 'asc' }
            ]
        });

        res.status(200).json(units);
    } catch (error) {
        next(error);
    }
};

export const getUnitById = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const unitId = Number(id);

        const unit = await prisma.unitOfMeasure.findUnique({
            where: { id: unitId },
            include: {
                baseUnit: true,
                equivalentUnit: true
            }
        });

        if (!unit) {
            throw new AppError('Unit not found', 404);
        }

        res.status(200).json(unit);
    } catch (error) {
        next(error);
    }
};

export const createUnit = async (
    req: Request<{}, {}, CreateUnitInput>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const unitData = req.body;

        // Use transaction for unit creation
        const unit = await prisma.$transaction(async (tx) => {
            // Check if base unit exists if specified
            if (unitData.baseUnitId) {
                const baseUnit = await tx.unitOfMeasure.findUnique({
                    where: { id: unitData.baseUnitId }
                });

                if (!baseUnit) {
                    throw new AppError('Base unit not found', 404);
                }
            }

            // Check if equivalent unit exists if specified
            if (unitData.equivalentUnitId) {
                const equivalentUnit = await tx.unitOfMeasure.findUnique({
                    where: { id: unitData.equivalentUnitId }
                });

                if (!equivalentUnit) {
                    throw new AppError('Equivalent unit not found', 404);
                }
            }

            return tx.unitOfMeasure.create({
                data: {
                    name: unitData.name,
                    abbreviation: unitData.abbreviation,
                    system: unitData.system,
                    type: unitData.type,
                    baseUnitId: unitData.baseUnitId,
                    conversionFactor: unitData.conversionFactor ?? 1.0,
                    equivalentUnitId: unitData.equivalentUnitId,
                    equivalentFactor: unitData.equivalentFactor
                },
                include: {
                    baseUnit: true,
                    equivalentUnit: true
                }
            });
        });

        res.status(201).json(unit);
    } catch (error) {
        next(error);
    }
};

export const updateUnit = async (
    req: Request<{ id: string }, {}, UpdateUnitInput>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const unitId = Number(id);
        const updateData = req.body;

        // Use transaction for unit update
        const unit = await prisma.$transaction(async (tx) => {
            // Check if unit exists
            const existingUnit = await tx.unitOfMeasure.findUnique({
                where: { id: unitId }
            });

            if (!existingUnit) {
                throw new AppError('Unit not found', 404);
            }

            // Check if base unit exists if specified
            if (updateData.baseUnitId) {
                const baseUnit = await tx.unitOfMeasure.findUnique({
                    where: { id: updateData.baseUnitId }
                });

                if (!baseUnit) {
                    throw new AppError('Base unit not found', 404);
                }
            }

            // Check if equivalent unit exists if specified
            if (updateData.equivalentUnitId) {
                const equivalentUnit = await tx.unitOfMeasure.findUnique({
                    where: { id: updateData.equivalentUnitId }
                });

                if (!equivalentUnit) {
                    throw new AppError('Equivalent unit not found', 404);
                }
            }

            return tx.unitOfMeasure.update({
                where: { id: unitId },
                data: updateData,
                include: {
                    baseUnit: true,
                    equivalentUnit: true
                }
            });
        });

        res.status(200).json(unit);
    } catch (error) {
        next(error);
    }
};

export const deleteUnit = async (
    req: Request,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { id } = req.params;
        const unitId = Number(id);

        // Use transaction for unit deletion with checks
        await prisma.$transaction(async (tx) => {
            // Check if unit exists
            const unit = await tx.unitOfMeasure.findUnique({
                where: { id: unitId }
            });

            if (!unit) {
                throw new AppError('Unit not found', 404);
            }

            // Check if unit is used by ingredients
            const ingredientCount = await tx.ingredient.count({
                where: {
                    OR: [
                        { defaultUnitId: unitId },
                        { packageUnitId: unitId }
                    ]
                }
            });

            if (ingredientCount > 0) {
                throw new AppError('Cannot delete unit that is used by ingredients', 400);
            }

            // Check if unit is used as a base unit for other units
            const derivedUnitCount = await tx.unitOfMeasure.count({
                where: { baseUnitId: unitId }
            });

            if (derivedUnitCount > 0) {
                throw new AppError('Cannot delete unit that is used as a base unit for other units', 400);
            }

            // Check if unit is used in recipe ingredients
            const recipeIngredientCount = await tx.recipeIngredient.count({
                where: { unitId }
            });

            if (recipeIngredientCount > 0) {
                throw new AppError('Cannot delete unit that is used in recipes', 400);
            }

            // Check if unit is used in density conversions
            const densityConversionCount = await tx.ingredientDensity.count({
                where: {
                    OR: [
                        { volumeUnitId: unitId },
                        { weightUnitId: unitId }
                    ]
                }
            });

            if (densityConversionCount > 0) {
                throw new AppError('Cannot delete unit that is used in density conversions', 400);
            }

            await tx.unitOfMeasure.delete({
                where: { id: unitId }
            });
        });

        res.status(204).send();
    } catch (error) {
        next(error);
    }
};

export const convertUnits = async (
    req: Request<{}, {}, UnitConversionInput>,
    res: Response,
    next: NextFunction
): Promise<void> => {
    try {
        const { quantity, fromUnitId, toUnitId, ingredientId } = req.body;

        // Get the units (no transaction needed for read-only operations)
        const fromUnit = await prisma.unitOfMeasure.findUnique({
            where: { id: fromUnitId },
            include: { baseUnit: true }
        });

        const toUnit = await prisma.unitOfMeasure.findUnique({
            where: { id: toUnitId },
            include: { baseUnit: true }
        });

        if (!fromUnit || !toUnit) {
            throw new AppError('One or both units not found', 404);
        }

        // Check if units are of the same type
        if (fromUnit.type !== toUnit.type) {
            // If converting between volume and weight, we need ingredient density
            if (
                (fromUnit.type === 'VOLUME' && toUnit.type === 'WEIGHT') ||
                (fromUnit.type === 'WEIGHT' && toUnit.type === 'VOLUME')
            ) {
                if (!ingredientId) {
                    throw new AppError('Ingredient ID is required for volume-weight conversion', 400);
                }

                // Find density conversion
                const densityConversion = await prisma.ingredientDensity.findFirst({
                    where: {
                        ingredientId,
                        volumeUnitId: fromUnit.type === 'VOLUME' ? fromUnit.id : toUnit.id,
                        weightUnitId: fromUnit.type === 'WEIGHT' ? fromUnit.id : toUnit.id
                    },
                    include: {
                        volumeUnit: true,
                        weightUnit: true
                    }
                });

                if (!densityConversion) {
                    throw new AppError('No density conversion found for this ingredient and units', 404);
                }

                const ingredientName = await getIngredientName(ingredientId);

                if (fromUnit.type === 'VOLUME') {
                    // Volume to weight
                    const result = {
                        originalQuantity: quantity,
                        originalUnit: fromUnit.abbreviation,
                        convertedQuantity: quantity * densityConversion.conversionFactor,
                        convertedUnit: toUnit.abbreviation,
                        conversionPath: `Converted using density factor: 1 ${fromUnit.abbreviation} = ${densityConversion.conversionFactor} ${toUnit.abbreviation} for ${ingredientName}`
                    };
                    res.status(200).json(result);
                    return;
                } else {
                    // Weight to volume
                    const result = {
                        originalQuantity: quantity,
                        originalUnit: fromUnit.abbreviation,
                        convertedQuantity: quantity / densityConversion.conversionFactor,
                        convertedUnit: toUnit.abbreviation,
                        conversionPath: `Converted using density factor: ${densityConversion.conversionFactor} ${toUnit.abbreviation} = 1 ${fromUnit.abbreviation} for ${ingredientName}`
                    };
                    res.status(200).json(result);
                    return;
                }
            } else {
                throw new AppError('Cannot convert between different unit types without density information', 400);
            }
        }

        // Same type conversion
        let convertedQuantity = quantity;
        let conversionPath = '';

        // Convert from source to base unit if needed
        if (fromUnit.baseUnitId && fromUnit.baseUnit) {
            convertedQuantity *= fromUnit.conversionFactor;
            conversionPath += `Converted ${quantity} ${fromUnit.abbreviation} to ${convertedQuantity} ${fromUnit.baseUnit.abbreviation}. `;
        }

        // Convert from base unit to target if needed
        if (toUnit.baseUnitId && toUnit.baseUnit) {
            convertedQuantity /= toUnit.conversionFactor;
            conversionPath += `Converted to ${convertedQuantity} ${toUnit.abbreviation}. `;
        } else if (fromUnit.baseUnitId && fromUnit.baseUnit && toUnit.id !== fromUnit.baseUnitId) {
            // If target is not the base unit and source had a base unit
            conversionPath += `Converted to ${convertedQuantity} ${toUnit.abbreviation}. `;
        }

        // If no conversion was needed
        if (!conversionPath) {
            conversionPath = 'Direct conversion, same unit type and base.';
        }

        const result = {
            originalQuantity: quantity,
            originalUnit: fromUnit.abbreviation,
            convertedQuantity,
            convertedUnit: toUnit.abbreviation,
            conversionPath: conversionPath.trim()
        };

        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

// Helper function to get ingredient name (no transaction needed for read-only operation)
async function getIngredientName(ingredientId: number): Promise<string> {
    const ingredient = await prisma.ingredient.findUnique({
        where: { id: ingredientId },
        select: { name: true }
    });

    return ingredient ? ingredient.name : 'Unknown Ingredient';
}