import type { Recipe, RecipeIngredient, Ingredient, UnitOfMeasure } from "@prisma/client"

// Extended types with relations
export type RecipeWithRelations = Recipe & {
    recipeIngredients: (RecipeIngredient & {
        ingredient: Ingredient
        unit: UnitOfMeasure
        alternateIngredient?: Ingredient | null
    })[]
    steps: any[]
}

export type ScaledIngredient = RecipeIngredient & {
    ingredient: Ingredient
    unit: UnitOfMeasure
    alternateIngredient?: Ingredient | null
    originalQuantity: number
    scaledQuantity: number
}

export type ScaledRecipe = {
    recipe: RecipeWithRelations
    scaledIngredients: ScaledIngredient[]
    originalServingSize: number
    targetServingSize: number
    scalingFactor: number
}

/**
 * Scales a recipe to a target number of servings
 */
export function scaleRecipe(recipe: RecipeWithRelations, targetServingSize: number): ScaledRecipe {
    const originalServingSize = recipe.servingSize
    const baseScalingFactor = targetServingSize / originalServingSize

    // Scale each ingredient using its individual scaling factor
    const scaledIngredients = recipe.recipeIngredients.map((ingredient) => {
        // Apply the ingredient-specific scaling factor if available, otherwise use the base scaling factor
        const ingredientScalingFactor = ingredient.scalingFactor || 1.0
        const effectiveScalingFactor = baseScalingFactor * ingredientScalingFactor

        // Calculate the scaled quantity
        const scaledQuantity = ingredient.quantity * effectiveScalingFactor

        // Round appropriately based on the quantity
        const roundedQuantity = roundQuantity(scaledQuantity)

        return {
            ...ingredient,
            originalQuantity: ingredient.quantity,
            scaledQuantity: roundedQuantity,
        }
    })

    return {
        recipe,
        scaledIngredients,
        originalServingSize,
        targetServingSize,
        scalingFactor: baseScalingFactor,
    }
}

/**
 * Rounds quantities appropriately based on their magnitude
 */
function roundQuantity(quantity: number): number {
    if (quantity >= 10) {
        // Round to the nearest whole number for large quantities
        return Math.round(quantity)
    } else if (quantity >= 1) {
        // Round to 1 decimal place for medium quantities
        return Math.round(quantity * 10) / 10
    } else {
        // Round to 2 decimal places for small quantities
        return Math.round(quantity * 100) / 100
    }
}