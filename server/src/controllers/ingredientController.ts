import { Request, Response } from "express"
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
export const getAllIngredients = async (req: Request, res: Response) => {
    try {
        const filters = req.query as unknown as IngredientFilters

        // Build filter conditions
        const where: any = {}

        if (filters.categoryId) {
            where.category_id = parseInt(filters.categoryId.toString())
        }

        if (filters.subcategoryId) {
            where.subcategory_id = parseInt(filters.subcategoryId.toString())
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
                default_unit: true,
                package_unit: true,
            },
            orderBy: { name: 'asc' },
        })

        res.json(ingredients)
    } catch (error) {
        console.error("Error fetching ingredients:", error)
        res.status(500).json({ error: "Failed to fetch ingredients" })
    }
}

/**
 * Get a single ingredient by ID
 */
export const getIngredientById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params

        const ingredient = await prisma.ingredient.findUnique({
            where: { ingredient_id: parseInt(id) },
            include: {
                category: true,
                subcategory: true,
                default_unit: true,
                package_unit: true,
                allergens: true,
                dietaryFlags: true,
                density_conversions: {
                    include: {
                        volume_unit: true,
                        weight_unit: true,
                    }
                },
            },
        })

        if (!ingredient) {
            return res.status(404).json({ error: "Ingredient not found" })
        }

        res.json(ingredient)
    } catch (error) {
        console.error("Error fetching ingredient:", error)
        res.status(500).json({ error: "Failed to fetch ingredient" })
    }
}

/**
 * Create a new ingredient
 */
export const createIngredient = async (req: Request, res: Response) => {
    try {
        const ingredientData: CreateIngredientInput = req.body

        const ingredient = await prisma.ingredient.create({
            data: ingredientData,
        })

        res.status(201).json(ingredient)
    } catch (error) {
        console.error("Error creating ingredient:", error)
        res.status(500).json({ error: "Failed to create ingredient" })
    }
}

/**
 * Update an existing ingredient
 */
export const updateIngredient = async (req: Request, res: Response) => {
    try {
        const { id } = req.params
        const ingredientData: UpdateIngredientInput = req.body

        const ingredient = await prisma.ingredient.update({
            where: { ingredient_id: parseInt(id) },
            data: ingredientData,
        })

        res.json(ingredient)
    } catch (error) {
        console.error("Error updating ingredient:", error)
        res.status(500).json({ error: "Failed to update ingredient" })
    }
}

/**
 * Delete an ingredient
 */
export const deleteIngredient = async (req: Request, res: Response) => {
    try {
        const { id } = req.params

        await prisma.ingredient.delete({
            where: { ingredient_id: parseInt(id) },
        })

        res.json({ message: "Ingredient deleted successfully" })
    } catch (error) {
        console.error("Error deleting ingredient:", error)
        res.status(500).json({ error: "Failed to delete ingredient" })
    }
}