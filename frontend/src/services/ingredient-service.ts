import api from "../lib/api"
import type {
    Ingredient,
    CreateIngredientInput,
    UpdateIngredientInput,
    IngredientCategory,
    IngredientSubcategory,
    IngredientFilters,
} from "@server/types/ingredient-types"

/**
 * Service for handling ingredient-related API calls
 */
export const ingredientService = {
    /**
     * Get all ingredients with optional filtering
     */
    getAll: async (filters: IngredientFilters = {}): Promise<Ingredient[]> => {
        const response = await api.get("/ingredients", { params: filters })
        return response.data
    },

    /**
     * Get a single ingredient by ID
     */
    getById: async (id: number): Promise<Ingredient> => {
        const response = await api.get(`/ingredients/${id}`)
        return response.data
    },

    /**
     * Create a new ingredient
     */
    create: async (data: CreateIngredientInput): Promise<Ingredient> => {
        const response = await api.post("/ingredients", data)
        return response.data
    },

    /**
     * Update an existing ingredient
     */
    update: async (id: number, data: UpdateIngredientInput): Promise<Ingredient> => {
        const response = await api.put(`/ingredients/${id}`, data)
        return response.data
    },

    /**
     * Delete an ingredient
     */
    delete: async (id: number): Promise<boolean> => {
        await api.delete(`/ingredients/${id}`)
        return true
    },

    /**
     * Get all ingredient categories
     */
    getCategories: async (): Promise<IngredientCategory[]> => {
        const response = await api.get("/categories")
        return response.data
    },

    /**
     * Get a single category by ID
     */
    getCategoryById: async (id: number): Promise<IngredientCategory> => {
        const response = await api.get(`/categories/${id}`)
        return response.data
    },

    /**
     * Get subcategories for a specific category
     */
    getSubcategories: async (categoryId: number): Promise<IngredientSubcategory[]> => {
        const response = await api.get(`/categories/${categoryId}/subcategories`)
        return response.data
    },
}

export default ingredientService
