import { Request, Response, NextFunction } from "express"
import { PrismaClient } from "@prisma/client"
import {
    CreateIngredientInput,
    UpdateIngredientInput,
    IngredientFilters
} from "../types/ingredient-types"

const prisma = new PrismaClient()

/**
 * Get all ingredients with optional filtering
 */
export const getAllIngredients = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const filters = req.query as unknown as IngredientFilters

        // Build filter conditions
        const where: any = {}

        if (filters.categoryId) {
            where.categoryId = parseInt(filters.categoryId.toString())
        }

        if (filters.subcategoryId) {
            where.subcategoryId = parseInt(filters.subcategoryId.toString())
        }

        if (filters.isPerishable !== undefined) {
            where.isPerishable = filters.isPerishable === 'true'
        }

        if (filters.storageType) {
            where.storageType = filters.storageType
        }

        if (filters.isLocal !== undefined) {
            where.isLocal = filters.isLocal === 'true'
        }

        if (filters.isOrganic !== undefined) {
            where.isOrganic = filters.isOrganic === 'true'
        }

        if (filters.isSeasonalItem !== undefined) {
            where.isSeasonalItem = filters.isSeasonalItem === 'true'
        }

        if (filters.isCommonAllergen !== undefined) {
            where.isCommonAllergen = filters.isCommonAllergen === 'true'
        }

        if (filters.search) {
            where.OR = [
                { name: { contains: filters.search, mode: 'insensitive' } },
                { description: { contains: filters.search, mode: 'insensitive' } }
            ]
        }

        const ingredients = await prisma.ingredient.findMany({
            where,
            include: {
                category: true,
                subcategory: true,
                defaultUnit: true,
                packageUnit: true,
            },
            orderBy: { name: 'asc' },
        })

        res.json(ingredients)
    } catch (error) {
        next(error)
    }
}

/**
 * Get a single ingredient by ID
 */
export const getIngredientById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params

        const ingredient = await prisma.ingredient.findUnique({
            where: { id: parseInt(id) },
            include: {
                category: true,
                subcategory: true,
                defaultUnit: true,
                packageUnit: true,
                allergens: true,
                dietaryFlags: true,
                densityConversions: {
                    include: {
                        volumeUnit: true,
                        weightUnit: true,
                    }
                },
            },
        })

        if (!ingredient) {
            res.status(404).json({ error: "Ingredient not found" })
            return
        }

        res.json(ingredient)
    } catch (error) {
        next(error)
    }
}

/**
 * Create a new ingredient
 */
export const createIngredient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const ingredientData: CreateIngredientInput = req.body

        // Transform the data to match Prisma schema
        const transformedData = {
            name: ingredientData.name,
            description: ingredientData.description,
            categoryId: ingredientData.categoryId,
            subcategoryId: ingredientData.subcategoryId,
            defaultUnitId: ingredientData.defaultUnitId,
            isPerishable: ingredientData.isPerishable,
            storageType: ingredientData.storageType,
            shelfLifeDays: ingredientData.shelfLifeDays,
            storageInstructions: ingredientData.storageInstructions,
            supplierInstructions: ingredientData.supplierInstructions,
            supplierNotes: ingredientData.supplierNotes,
            preferredSupplier: ingredientData.preferredSupplier,
            orderLeadTimeDays: ingredientData.orderLeadTimeDays,
            costPerUnitDollars: ingredientData.costPerUnitDollars,
            packageSize: ingredientData.packageSize,
            packageUnitId: ingredientData.packageUnitId,
            isLocal: ingredientData.isLocal,
            isOrganic: ingredientData.isOrganic,
            isSeasonalItem: ingredientData.isSeasonalItem,
            hasVariablePrice: ingredientData.hasVariablePrice,
            isCommonAllergen: ingredientData.isCommonAllergen,
            isSpecialOrder: ingredientData.isSpecialOrder
        }

        const ingredient = await prisma.ingredient.create({
            data: transformedData,
            include: {
                category: true,
                defaultUnit: true
            }
        })

        res.status(201).json(ingredient)
    } catch (error) {
        next(error)
    }
}

/**
 * Update an existing ingredient
 */
export const updateIngredient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params
        const ingredientData: UpdateIngredientInput = req.body

        const ingredient = await prisma.ingredient.update({
            where: { id: parseInt(id) },
            data: ingredientData,
            include: {
                category: true,
                subcategory: true,
                defaultUnit: true,
                packageUnit: true,
            }
        })

        res.json(ingredient)
    } catch (error) {
        next(error)
    }
}

/**
 * Delete an ingredient
 */
export const deleteIngredient = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const { id } = req.params

        await prisma.ingredient.delete({
            where: { id: parseInt(id) },
        })

        res.json({ message: "Ingredient deleted successfully" })
    } catch (error) {
        next(error)
    }
}