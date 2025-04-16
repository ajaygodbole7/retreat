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

import type {
    Event,
    EventDay,
    EventDayConsumable,
    CreateEventInput,
    UpdateEventInput,
    CreateEventDayInput,
    UpdateEventDayInput,
    EventDayConsumableInput,
    UpdateEventDayConsumableInput,
    Menu,
    MenuRecipe,
    CreateScheduledMealInput,
    UpdateScheduledMealInput,
    ScheduledMeal,
    ScheduledMealRecipe
} from '@server/types/event-types';

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
        const response = await api.get(`/ingredients/${ id }`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/ingredients', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/ingredients/${ id }`, data);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`/ingredients/${ id }`);
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
        const response = await api.get(`/categories/${ id }`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/categories', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/categories/${ id }`, data);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`/categories/${ id }`);
        return true;
    },

    // Subcategory methods
    getSubcategories: async (categoryId) => {
        if (!categoryId) return [];
        const response = await api.get(`/categories/${ categoryId }/subcategories`);
        return response.data;
    },

    getSubcategoryById: async (id) => {
        const response = await api.get(`/categories/subcategories/${ id }`);
        return response.data;
    },

    createSubcategory: async (categoryId, data) => {
        const response = await api.post(`/categories/${ categoryId }/subcategories`, data);
        return response.data;
    },

    updateSubcategory: async (id, data) => {
        const response = await api.put(`/categories/subcategories/${ id }`, data);
        return response.data;
    },

    deleteSubcategory: async (id) => {
        await api.delete(`/categories/subcategories/${ id }`);
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
        const response = await api.get(`/units/${ id }`);
        return response.data;
    },

    create: async (data) => {
        const response = await api.post('/units', data);
        return response.data;
    },

    update: async (id, data) => {
        const response = await api.put(`/units/${ id }`, data);
        return response.data;
    },

    delete: async (id) => {
        await api.delete(`/units/${ id }`);
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
        const response = await api.get(`/recipes/${ id }`)
        console.log("API - getById response:", response.data)
        return response.data
    },

    create: async (data: CreateRecipeInput) => {
        const response = await api.post("/recipes", data)
        return response.data
    },

    update: async (id: number, data: UpdateRecipeInput) => {
        const response = await api.put(`/recipes/${ id }`, data)
        return response.data
    },

    delete: async (id: number) => {
        await api.delete(`/recipes/${ id }`)
        return true
    },

    // Recipe Step methods
    getSteps: async (recipeId: number) => {
        const response = await api.get(`/recipes/${ recipeId }/steps`)
        return response.data
    },

    getStepById: async (id: number) => {
        const response = await api.get(`/recipes/steps/${ id }`)
        return response.data
    },

    createStep: async (data: CreateRecipeStepInput) => {
        const response = await api.post("/recipes/steps", data)
        return response.data
    },

    updateStep: async (id: number, data: UpdateRecipeStepInput) => {
        const response = await api.put(`/recipes/steps/${ id }`, data)
        return response.data
    },

    deleteStep: async (id: number) => {
        await api.delete(`/recipes/steps/${ id }`)
        return true
    },

    // Recipe Ingredient methods
    getIngredients: async (recipeId: number) => {
        const response = await api.get(`/recipes/${ recipeId }/ingredients`)
        return response.data
    },

    getIngredientById: async (id: number) => {
        const response = await api.get(`/recipes/ingredients/${ id }`)
        return response.data
    },

    createIngredient: async (data: CreateRecipeIngredientInput) => {
        const response = await api.post("/recipes/ingredients", data)
        return response.data
    },

    updateIngredient: async (id: number, data: UpdateRecipeIngredientInput) => {
        const response = await api.put(`/recipes/ingredients/${ id }`, data)
        return response.data
    },

    deleteIngredient: async (id: number) => {
        await api.delete(`/recipes/ingredients/${ id }`)
        return true
    },
}

// --- Event API ---
export const eventApi = {
    getAll: async (): Promise<Event[]> => {
        const response = await api.get('/events');
        return response.data;
    },
    getById: async (eventId: number): Promise<Event> => {
        const response = await api.get(`/events/${ eventId }`);
        return response.data;
    },
    create: async (data: CreateEventInput): Promise<Event> => { // Param uses backend type
        const response = await api.post('/events', data);
        return response.data;
    },
    update: async (eventId: number, data: UpdateEventInput): Promise<Event> => { // Param uses backend type
        const response = await api.put(`/events/${ eventId }`, data);
        return response.data;
    },
    delete: async (eventId: number): Promise<boolean> => {
        await api.delete(`/events/${ eventId }`);
        return true;
    },
    // EventDay methods
    addDay: async (eventId: number, data: CreateEventDayInput): Promise<EventDay> => { // Param uses backend type
        const response = await api.post(`/events/${ eventId }/days`, data);
        return response.data;
    },
    updateDay: async (dayId: number, data: UpdateEventDayInput): Promise<EventDay> => { // Param uses backend type
        const response = await api.put(`/events/days/${ dayId }`, data);
        return response.data;
    },
    deleteDay: async (dayId: number): Promise<boolean> => {
        await api.delete(`/events/days/${ dayId }`);
        return true;
    },
    // EventDayConsumable methods
    addConsumable: async (dayId: number, data: EventDayConsumableInput): Promise<EventDayConsumable> => { // Param uses backend type
        const response = await api.post(`/events/days/${ dayId }/consumables`, data);
        return response.data;
    },
    updateConsumable: async (consumableId: number, data: UpdateEventDayConsumableInput): Promise<EventDayConsumable> => { // Param uses backend type
        const response = await api.put(`/events/consumables/${ consumableId }`, data);
        return response.data;
    },
    deleteConsumable: async (consumableId: number): Promise<boolean> => {
        await api.delete(`/events/consumables/${ consumableId }`);
        return true;
    },
};

// --- Menu API (Based on Test Script Needs) ---
export const menuApi = {
    // Get all menus (simplified for dropdown, adjust based on actual API)
    getAllSimple: async (): Promise<Pick<Menu, 'id' | 'name' | 'mealType'>[]> => {
        // Use query param or separate endpoint if available for optimization
        const response = await api.get('/menus');
        // If the full menu is returned, map it here, otherwise adjust endpoint
        return response.data.map((m: Menu) => ({ id: m.id, name: m.name, mealType: m.mealType }));
    },
    // Create Menu (needed for test script)
    create: async (data: { name: string; description?: string; mealType?: string }): Promise<Menu> => {
        const response = await api.post('/menus', data);
        return response.data;
    },
    // Get Menu By ID (needed for test script)
    getById: async (menuId: number): Promise<Menu> => {
        const response = await api.get(`/menus/${ menuId }`);
        return response.data; // Assuming it includes menuItems relation
    },
    // Delete Menu (needed for test script cleanup)
    delete: async (menuId: number): Promise<boolean> => {
        await api.delete(`/menus/${ menuId }`);
        return true;
    },
    // Add Recipe to Menu (needed for test script)
    addRecipeToMenu: async (menuId: number, data: { recipeId: number; displayOrder?: number }): Promise<any> => {
        const response = await api.post(`/menus/${ menuId }/recipes`, data);
        return response.data; // Return type depends on backend
    },
    // Remove Recipe from Menu (needed for test script)
    removeRecipeFromMenu: async (menuId: number, recipeId: number): Promise<boolean> => {
        await api.delete(`/menus/${ menuId }/recipes/${ recipeId }`);
        return true;
    },
    // Add other menu methods (update) if needed
};

// --- Scheduled Meal API (Based on Test Script Needs) ---
export const scheduledMealApi = {
    // Create a new scheduled meal for a specific day
    create: async (dayId: number, data: CreateScheduledMealInput): Promise<ScheduledMeal> => {
        const response = await api.post(`/events/days/${ dayId }/meals`, data);
        return response.data;
    },
    // Update an existing scheduled meal
    update: async (mealId: number, data: UpdateScheduledMealInput): Promise<ScheduledMeal> => {
        const response = await api.put(`/scheduled-meals/${ mealId }`, data);
        return response.data;
    },
    // Delete a scheduled meal
    delete: async (mealId: number): Promise<boolean> => {
        await api.delete(`/scheduled-meals/${ mealId }`);
        return true;
    },
    // Add Recipe directly to Scheduled Meal (needed for test script)
    addRecipeToMeal: async (mealId: number, data: { recipeId: number }): Promise<any> => {
        const response = await api.post(`/scheduled-meals/${ mealId }/recipes`, data);
        return response.data; // Type depends on backend response
    },
    // Remove Recipe directly from Scheduled Meal (needed for test script)
    removeRecipeFromMeal: async (mealId: number, recipeId: number): Promise<boolean> => {
        await api.delete(`/scheduled-meals/${ mealId }/recipes/${ recipeId }`);
        return true;
    },
    // Get meals for a day (if not included in event details)
    // We assume event details includes meals for now,
    // Get meals for a day
    getAllForDay: async (dayId: number): Promise<any[]> => {
        console.log(`API: Fetching meals for day ${ dayId }`)
        try {
            // This should match the endpoint in the test script: /events/days/${dayId}/meals
            const response = await api.get(`/events/days/${ dayId }/meals`)
            console.log(`API Response for day ${ dayId } meals:`, response.data)
            return response.data || []
        } catch (error) {
            console.error(`API Error fetching meals for day ${ dayId }:`, error)
            throw error
        }
    },
};

export default api;