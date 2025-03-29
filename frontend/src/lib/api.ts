// frontend/src/lib/api.ts
import axios from 'axios';
import type {
    RecipeFilters,
    CreateRecipeInput,
    UpdateRecipeInput,
    CreateRecipeStepInput,
    UpdateRecipeStepInput,
    CreateRecipeIngredientInput,
    UpdateRecipeIngredientInput,
} from "@server/types/recipe-types"

// Create axios instance with base URL and default headers
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

// Add request interceptor for handling auth tokens if needed
api.interceptors.request.use(
    (config) => {
        // You can add auth tokens here if needed
        return config
    },
    (error) => {
        return Promise.reject(error)
    },
)


// Add request interceptor for error handling
api.interceptors.response.use(
    (response) => response,
    (error) => {
        // Handle errors globally
        if (error.response) {
            // Server responded with a status code outside of 2xx range
            console.error('API Error:', error.response.data);
        } else if (error.request) {
            // Request was made but no response was received
            console.error('Network Error:', error.request);
        } else {
            // Something else happened while setting up the request
            console.error('Error:', error.message);
        }
        return Promise.reject(error);
    }
);

// Ingredient API
export const ingredientApi = {
    getAll: async (filters = {}) => {
        const response = await api.get('/ingredients', { params: filters });
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/ingredients/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/ingredients', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/ingredients/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`/ingredients/${id}`);
        return true;
    }
};

// Category API
export const categoryApi = {
    getAll: async () => {
        const response = await api.get('/categories');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/categories/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/categories', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/categories/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`/categories/${id}`);
        return true;
    },

    // Subcategory methods
    getSubcategories: async (categoryId) => {
        if (!categoryId) return [];
        const response = await api.get(`/categories/${categoryId}/subcategories`);
        return response.data;
    },

    getSubcategoryById: async (id) => {
        const response = await api.get(`/categories/subcategories/${id}`);
        return response.data;
    },

    createSubcategory: async (categoryId, data) => {
        const response = await api.post(`/categories/${categoryId}/subcategories`, data);
        return response.data;
    },

    updateSubcategory: async (id, data) => {
        const response = await api.put(`/categories/subcategories/${id}`, data);
        return response.data;
    },

    deleteSubcategory: async (id) => {
        await api.delete(`/categories/subcategories/${id}`);
        return true;
    }
};

// Unit of Measure API
export const unitApi = {
    getAll: async () => {
        const response = await api.get('/units');
        return response.data;
    },

    getById: async (id) => {
        const response = await api.get(`/units/${id}`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/units', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/units/${id}`, data);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`/units/${id}`);
        return true;
    },

    convert: async (conversionData) => {
        const response = await api.post('/units/convert', conversionData);
        return response.data;
    }
};

// Recipe API
export const recipeApi = {
    // Recipe methods
    getAll: async (filters: RecipeFilters = {}) => {
        console.log("API - getAll recipes with filters:", filters)
        const response = await api.get("/recipes", { params: filters })
        console.log("API - getAll response:", response.data)
        return response.data
    },

    getById: async (id: number) => {
        console.log("API - getById called with:", id)
        if (!id || isNaN(id)) {
            console.error("API - Invalid recipe ID:", id)
            throw new Error("Invalid recipe ID")
        }
        const response = await api.get(`/recipes/${id}`)
        console.log("API - getById response:", response.data)
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

export default api;