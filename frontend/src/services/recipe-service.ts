import api from "../lib/api"
import type {
    CreateRecipeInput,
    UpdateRecipeInput,
    CreateRecipeStepInput,
    UpdateRecipeStepInput,
    CreateRecipeIngredientInput,
    UpdateRecipeIngredientInput,
    RecipeFilters,
} from "@server/types/recipe-types"

// Recipe API Service
export const recipeApi = {
    // Recipe methods
    getAll: async (filters: RecipeFilters = {}) => {
        const response = await api.get("/recipes", { params: filters })
        return response.data
    },

    getById: async (id: number) => {
        const response = await api.get(`/recipes/${id}`)
        return response.data
    },

    create: async (data: CreateRecipeInput) => {
        const response = await api.post("/recipes", data)
        return response.data
    },

    update: async (id: number, data: UpdateRecipeInput) => {
        const response = await api.put(`/recipes/${id}`, data)
        return response.data
    },

    delete: async (id: number) => {
        await api.delete(`/recipes/${id}`)
        return true
    },

    // Recipe Step methods
    getSteps: async (recipeId: number) => {
        const response = await api.get(`/recipes/${recipeId}/steps`)
        return response.data
    },

    getStepById: async (id: number) => {
        const response = await api.get(`/recipes/steps/${id}`)
        return response.data
    },

    createStep: async (data: CreateRecipeStepInput) => {
        const response = await api.post("/recipes/steps", data)
        return response.data
    },

    updateStep: async (id: number, data: UpdateRecipeStepInput) => {
        const response = await api.put(`/recipes/steps/${id}`, data)
        return response.data
    },

    deleteStep: async (id: number) => {
        await api.delete(`/recipes/steps/${id}`)
        return true
    },

    // Recipe Ingredient methods
    getIngredients: async (recipeId: number) => {
        const response = await api.get(`/recipes/${recipeId}/ingredients`)
        return response.data
    },

    getIngredientById: async (id: number) => {
        const response = await api.get(`/recipes/ingredients/${id}`)
        return response.data
    },

    createIngredient: async (data: CreateRecipeIngredientInput) => {
        const response = await api.post("/recipes/ingredients", data)
        return response.data
    },

    updateIngredient: async (id: number, data: UpdateRecipeIngredientInput) => {
        const response = await api.put(`/recipes/ingredients/${id}`, data)
        return response.data
    },

    deleteIngredient: async (id: number) => {
        await api.delete(`/recipes/ingredients/${id}`)
        return true
    },
}

