import api from "../lib/api"
import { convertDatesToStrings, parseStringsToDates } from "../utils/date-utils"
import type {
    Recipe,
    CreateRecipeInput,
    UpdateRecipeInput,
    RecipeFilters,
    CreateRecipeStepInput,
    UpdateRecipeStepInput,
    CreateRecipeIngredientInput,
    UpdateRecipeIngredientInput,
    RecipeStep,
    RecipeIngredient,
} from "@server/types/recipe-types"

// Base API URL
const API_URL = "/recipes"

/**
 * Service for interacting with the recipes API
 */
export const recipeService = {
    /**
     * Get all recipes with optional filtering
     */
    async getAll(filters: RecipeFilters = {}): Promise<Recipe[]> {
        try {
            console.log("Fetching recipes with filters:", filters)
            const response = await api.get(API_URL, { params: filters })
            console.log("Received recipes:", response.data)
            return parseStringsToDates(response.data)
        } catch (error) {
            console.error("Error fetching recipes:", error)
            return []
        }
    },

    /**
     * Get a recipe by ID with all details (ingredients and steps)
     */
    async getById(id: number): Promise<Recipe> {
        try {
            console.log(`Fetching recipe ${id}`)
            const response = await api.get(`${API_URL}/${id}`)
            console.log(`Received recipe ${id}:`, response.data)
            return parseStringsToDates(response.data)
        } catch (error) {
            console.error(`Error fetching recipe ${id}:`, error)
            throw error
        }
    },

    /**
     * Create a new recipe (basic details only)
     */
    async create(data: CreateRecipeInput): Promise<Recipe> {
        try {
            console.log("Creating recipe with data:", data)
            const response = await api.post(API_URL, convertDatesToStrings(data))
            console.log("Created recipe:", response.data)
            return parseStringsToDates(response.data)
        } catch (error) {
            console.error("Error creating recipe:", error)
            throw error
        }
    },

    /**
     * Update an existing recipe (basic details only)
     */
    async update(id: number, data: UpdateRecipeInput): Promise<Recipe> {
        try {
            console.log(`Updating recipe ${id} with data:`, data)
            const response = await api.put(`${API_URL}/${id}`, convertDatesToStrings(data))
            console.log(`Updated recipe ${id}:`, response.data)
            return parseStringsToDates(response.data)
        } catch (error) {
            console.error(`Error updating recipe ${id}:`, error)
            throw error
        }
    },

    /**
     * Delete a recipe
     */
    async delete(id: number): Promise<void> {
        try {
            console.log(`Deleting recipe ${id}`)
            await api.delete(`${API_URL}/${id}`)
            console.log(`Recipe ${id} deleted successfully`)
        } catch (error) {
            console.error(`Error deleting recipe ${id}:`, error)
            throw error
        }
    },

    /**
     * Create a complete recipe with ingredients and steps in one operation
     */
    async createComplete(data: {
        recipe: Partial<CreateRecipeInput>
        ingredients?: Partial<CreateRecipeIngredientInput>[]
        steps?: Partial<CreateRecipeStepInput>[]
    }): Promise<Recipe> {
        try {
            console.log("Creating complete recipe with data:", data)
            const response = await api.post(`${API_URL}/complete`, convertDatesToStrings(data))
            console.log("Created complete recipe:", response.data)
            return parseStringsToDates(response.data)
        } catch (error) {
            console.error("Error creating complete recipe:", error)
            throw error
        }
    },

    /**
     * Update a complete recipe with ingredients and steps in one operation
     */
    async updateComplete(
        id: number,
        data: {
            recipe: Partial<UpdateRecipeInput>
            ingredients?: Partial<RecipeIngredient>[]
            steps?: Partial<RecipeStep>[]
        },
    ): Promise<Recipe> {
        try {
            console.log(`Updating complete recipe ${id} with data:`, data)
            const response = await api.put(`${API_URL}/${id}/complete`, convertDatesToStrings(data))
            console.log(`Updated complete recipe ${id}:`, response.data)
            return parseStringsToDates(response.data)
        } catch (error) {
            console.error(`Error updating complete recipe ${id}:`, error)
            throw error
        }
    },

    /**
     * Scale a recipe to a target number of servings
     */
    async scaleRecipe(id: number, targetServingSize: number): Promise<Recipe> {
        try {
            console.log(`Scaling recipe ${id} to ${targetServingSize} servings`)
            const response = await api.get(`${API_URL}/${id}/scale`, {
                params: { targetServingSize },
            })
            console.log(`Scaled recipe ${id}:`, response.data)
            return parseStringsToDates(response.data)
        } catch (error) {
            console.error(`Error scaling recipe ${id}:`, error)
            throw error
        }
    },

    // Recipe Steps API
    async getSteps(recipeId: number): Promise<RecipeStep[]> {
        try {
            const response = await api.get(`${API_URL}/${recipeId}/steps`)
            return parseStringsToDates(response.data)
        } catch (error) {
            console.error(`Error fetching steps for recipe ${recipeId}:`, error)
            return []
        }
    },

    async createStep(data: CreateRecipeStepInput): Promise<RecipeStep> {
        try {
            const response = await api.post(`${API_URL}/steps`, convertDatesToStrings(data))
            return parseStringsToDates(response.data)
        } catch (error) {
            console.error("Error creating recipe step:", error)
            throw error
        }
    },

    async updateStep(id: number, data: UpdateRecipeStepInput): Promise<RecipeStep> {
        try {
            const response = await api.put(`${API_URL}/steps/${id}`, convertDatesToStrings(data))
            return parseStringsToDates(response.data)
        } catch (error) {
            console.error(`Error updating recipe step ${id}:`, error)
            throw error
        }
    },

    async deleteStep(id: number): Promise<void> {
        try {
            await api.delete(`${API_URL}/steps/${id}`)
        } catch (error) {
            console.error(`Error deleting recipe step ${id}:`, error)
            throw error
        }
    },

    // Recipe Ingredients API
    async getIngredients(recipeId: number): Promise<RecipeIngredient[]> {
        try {
            const response = await api.get(`${API_URL}/${recipeId}/ingredients`)
            return parseStringsToDates(response.data)
        } catch (error) {
            console.error(`Error fetching ingredients for recipe ${recipeId}:`, error)
            return []
        }
    },

    async createIngredient(data: CreateRecipeIngredientInput): Promise<RecipeIngredient> {
        try {
            const response = await api.post(`${API_URL}/ingredients`, convertDatesToStrings(data))
            return parseStringsToDates(response.data)
        } catch (error) {
            console.error("Error creating recipe ingredient:", error)
            throw error
        }
    },

    async updateIngredient(id: number, data: UpdateRecipeIngredientInput): Promise<RecipeIngredient> {
        try {
            const response = await api.put(`${API_URL}/ingredients/${id}`, convertDatesToStrings(data))
            return parseStringsToDates(response.data)
        } catch (error) {
            console.error(`Error updating recipe ingredient ${id}:`, error)
            throw error
        }
    },

    async deleteIngredient(id: number): Promise<void> {
        try {
            await api.delete(`${API_URL}/ingredients/${id}`)
        } catch (error) {
            console.error(`Error deleting recipe ingredient ${id}:`, error)
            throw error
        }
    },
}

export default recipeService