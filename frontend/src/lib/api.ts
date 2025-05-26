// frontend/src/lib/api.ts
import axios, { AxiosError, AxiosResponse } from 'axios';
import type {
    RecipeFilters,
    CreateRecipeInput,
    UpdateRecipeInput,
    CreateRecipeStepInput,
    UpdateRecipeStepInput,
    CreateRecipeIngredientInput,
    UpdateRecipeIngredientInput,
} from "@server/types/recipe-types";

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

import type {
    ShoppingListItemData,
    ShoppingListData,
    ShoppingListWithItems,
    AggregatedShoppingItem,
    GroupedShoppingList
} from "@server/types/shopping-list-types";

import type {
    LoginInput,
    RegisterInput,
    User,
    AuthResponse
} from '@server/types/auth-types';

// --- Centralized Error Types ---
export interface ApiErrorData {
    message?: string;
    errors?: Record<string, string[]>;
    code?: string;
    details?: any;
}

export interface ApiError extends Error {
    response?: {
        status: number;
        data?: ApiErrorData;
        statusText?: string;
    };
    request?: any;
    code?: string;
    config?: any;
}

// Type guard for API errors
export const isApiError = (error: any): error is ApiError => {
    return error && (error.response || error.request);
};

// Helper to extract meaningful error message
export const getErrorMessage = (error: ApiError | Error): string => {
    if (isApiError(error)) {
        return error.response?.data?.message ||
            error.response?.statusText ||
            error.message ||
            'An unexpected error occurred';
    }
    return error.message || 'An unexpected error occurred';
};

// Helper to check if error is authentication related
export const isAuthError = (error: ApiError | Error): boolean => {
    if (isApiError(error)) {
        return error.response?.status === 401 || error.response?.status === 403;
    }
    return false;
};

// --- API Client Setup ---
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true,
    timeout: 10000, // 10 second timeout
});

// --- Request Interceptor ---
api.interceptors.request.use(
    (config) => {
        try {
            const token = localStorage.getItem('authToken');
            if (token && config.headers) {
                config.headers['Authorization'] = `Bearer ${ token }`;
                console.log('API Interceptor: Added Auth Token to request for URL:', config.url);
            }
        } catch (error) {
            console.warn('API Interceptor: Failed to read auth token from localStorage:', error);
        }
        return config;
    },
    (error) => {
        console.error('API Interceptor: Request error:', error);
        return Promise.reject(error);
    }
);

// --- Response Interceptor ---
api.interceptors.response.use(
    (response: AxiosResponse) => {
        // Log successful responses in development
        if (import.meta.env.DEV) {
            console.log('API Success:', {
                method: response.config.method?.toUpperCase(),
                url: response.config.url,
                status: response.status,
            });
        }
        return response;
    },
    (error: AxiosError<ApiErrorData>) => {
        // Create structured error object
        const apiError: ApiError = {
            name: error.name,
            message: error.message,
            response: error.response ? {
                status: error.response.status,
                data: error.response.data,
                statusText: error.response.statusText,
            } : undefined,
            request: error.request,
            code: error.code,
            config: error.config,
        };

        // Log error details
        console.error('API Error:', {
            status: apiError.response?.status,
            url: error.config?.url,
            method: error.config?.method?.toUpperCase(),
            message: getErrorMessage(apiError),
            data: apiError.response?.data,
        });

        // Handle specific error types
        if (apiError.response?.status === 401) {
            console.warn('API: Unauthorized (401) - Token might be invalid/expired');

            // Dispatch global auth error event
            window.dispatchEvent(new CustomEvent('auth-unauthorized', {
                detail: {
                    error: apiError,
                    url: error.config?.url,
                    method: error.config?.method
                }
            }));
        } else if (apiError.response?.status === 403) {
            console.warn('API: Forbidden (403) - Insufficient permissions');

            window.dispatchEvent(new CustomEvent('auth-forbidden', {
                detail: {
                    error: apiError,
                    url: error.config?.url,
                    method: error.config?.method
                }
            }));
        } else if (apiError.response?.status === 422) {
            console.warn('API: Validation Error (422):', apiError.response.data?.errors);
        } else if (apiError.response?.status >= 500) {
            console.error('API: Server Error (5xx)');

            // Dispatch server error event for global error handling
            window.dispatchEvent(new CustomEvent('api-server-error', {
                detail: { error: apiError }
            }));
        } else if (!apiError.response) {
            console.error('API: Network Error - No response received');

            window.dispatchEvent(new CustomEvent('api-network-error', {
                detail: { error: apiError }
            }));
        }

        return Promise.reject(apiError);
    }
);

// --- API Functions with Better Error Handling ---

// Ingredient API
export const ingredientApi = {
    getAll: async (filters = {}) => {
        const response = await api.get('/ingredients', { params: filters });
        return response.data;
    },
    getById: async (id: string | number) => {
        const response = await api.get(`/ingredients/${ id }`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/ingredients', data);
        return response.data;
    },
    update: async (id: string | number, data: any) => {
        const response = await api.put(`/ingredients/${ id }`, data);
        return response.data;
    },
    delete: async (id: string | number) => {
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
    getById: async (id: string | number) => {
        const response = await api.get(`/categories/${ id }`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/categories', data);
        return response.data;
    },
    update: async (id: string | number, data: any) => {
        const response = await api.put(`/categories/${ id }`, data);
        return response.data;
    },
    delete: async (id: string | number) => {
        await api.delete(`/categories/${ id }`);
        return true;
    },
    getSubcategories: async (categoryId: string | number) => {
        if (!categoryId) return [];
        const response = await api.get(`/categories/${ categoryId }/subcategories`);
        return response.data;
    },
    getSubcategoryById: async (id: string | number) => {
        const response = await api.get(`/categories/subcategories/${ id }`);
        return response.data;
    },
    createSubcategory: async (categoryId: string | number, data: any) => {
        const response = await api.post(`/categories/${ categoryId }/subcategories`, data);
        return response.data;
    },
    updateSubcategory: async (id: string | number, data: any) => {
        const response = await api.put(`/categories/subcategories/${ id }`, data);
        return response.data;
    },
    deleteSubcategory: async (id: string | number) => {
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
    getById: async (id: string | number) => {
        const response = await api.get(`/units/${ id }`);
        return response.data;
    },
    create: async (data: any) => {
        const response = await api.post('/units', data);
        return response.data;
    },
    update: async (id: string | number, data: any) => {
        const response = await api.put(`/units/${ id }`, data);
        return response.data;
    },
    delete: async (id: string | number) => {
        await api.delete(`/units/${ id }`);
        return true;
    },
    convert: async (conversionData: any) => {
        const response = await api.post('/units/convert', conversionData);
        return response.data;
    }
};

// Recipe API with proper typing
export const recipeApi = {
    getAll: async (filters: RecipeFilters = {}) => {
        console.log("API - getAll recipes with filters:", filters);
        const response = await api.get("/recipes", { params: filters });
        console.log("API - getAll response:", response.data);
        return response.data;
    },
    getById: async (id: number) => {
        console.log("API - getById called with:", id);
        if (!id || isNaN(id)) {
            console.error("API - Invalid recipe ID:", id);
            throw new Error("Invalid recipe ID");
        }
        const response = await api.get(`/recipes/${ id }`);
        console.log("API - getById response:", response.data);
        return response.data;
    },
    create: async (data: CreateRecipeInput) => {
        const response = await api.post("/recipes", data);
        return response.data;
    },
    update: async (id: number, data: UpdateRecipeInput) => {
        const response = await api.put(`/recipes/${ id }`, data);
        return response.data;
    },
    delete: async (id: number) => {
        await api.delete(`/recipes/${ id }`);
        return true;
    },
    getSteps: async (recipeId: number) => {
        const response = await api.get(`/recipes/${ recipeId }/steps`);
        return response.data;
    },
    getStepById: async (id: number) => {
        const response = await api.get(`/recipes/steps/${ id }`);
        return response.data;
    },
    createStep: async (data: CreateRecipeStepInput) => {
        const response = await api.post("/recipes/steps", data);
        return response.data;
    },
    updateStep: async (id: number, data: UpdateRecipeStepInput) => {
        const response = await api.put(`/recipes/steps/${ id }`, data);
        return response.data;
    },
    deleteStep: async (id: number) => {
        await api.delete(`/recipes/steps/${ id }`);
        return true;
    },
    getIngredients: async (recipeId: number) => {
        const response = await api.get(`/recipes/${ recipeId }/ingredients`);
        return response.data;
    },
    getIngredientById: async (id: number) => {
        const response = await api.get(`/recipes/ingredients/${ id }`);
        return response.data;
    },
    createIngredient: async (data: CreateRecipeIngredientInput) => {
        const response = await api.post("/recipes/ingredients", data);
        return response.data;
    },
    updateIngredient: async (id: number, data: UpdateRecipeIngredientInput) => {
        const response = await api.put(`/recipes/ingredients/${ id }`, data);
        return response.data;
    },
    deleteIngredient: async (id: number) => {
        await api.delete(`/recipes/ingredients/${ id }`);
        return true;
    },
};

// Event API
export const eventApi = {
    getAll: async (): Promise<Event[]> => {
        const response = await api.get('/events');
        return response.data;
    },
    getById: async (eventId: number): Promise<Event> => {
        const response = await api.get(`/events/${ eventId }`);
        return response.data;
    },
    create: async (data: CreateEventInput): Promise<Event> => {
        const response = await api.post('/events', data);
        return response.data;
    },
    update: async (eventId: number, data: UpdateEventInput): Promise<Event> => {
        const response = await api.put(`/events/${ eventId }`, data);
        return response.data;
    },
    delete: async (eventId: number): Promise<boolean> => {
        await api.delete(`/events/${ eventId }`);
        return true;
    },
    addDay: async (eventId: number, data: CreateEventDayInput): Promise<EventDay> => {
        const response = await api.post(`/events/${ eventId }/days`, data);
        return response.data;
    },
    updateDay: async (dayId: number, data: UpdateEventDayInput): Promise<EventDay> => {
        const response = await api.put(`/events/days/${ dayId }`, data);
        return response.data;
    },
    deleteDay: async (dayId: number): Promise<boolean> => {
        await api.delete(`/events/days/${ dayId }`);
        return true;
    },
    addConsumable: async (dayId: number, data: EventDayConsumableInput): Promise<EventDayConsumable> => {
        const response = await api.post(`/events/days/${ dayId }/consumables`, data);
        return response.data;
    },
    updateConsumable: async (consumableId: number, data: UpdateEventDayConsumableInput): Promise<EventDayConsumable> => {
        const response = await api.put(`/events/consumables/${ consumableId }`, data);
        return response.data;
    },
    deleteConsumable: async (consumableId: number): Promise<boolean> => {
        await api.delete(`/events/consumables/${ consumableId }`);
        return true;
    },
};

// Menu API
export const menuApi = {
    getAllSimple: async (): Promise<Pick<Menu, 'id' | 'name' | 'mealType'>[]> => {
        const response = await api.get('/menus');
        return response.data.map((m: Menu) => ({ id: m.id, name: m.name, mealType: m.mealType }));
    },
    create: async (data: { name: string; description?: string; mealType?: string }): Promise<Menu> => {
        const response = await api.post('/menus', data);
        return response.data;
    },
    getById: async (menuId: number): Promise<Menu> => {
        const response = await api.get(`/menus/${ menuId }`);
        return response.data;
    },
    delete: async (menuId: number): Promise<boolean> => {
        await api.delete(`/menus/${ menuId }`);
        return true;
    },
    addRecipeToMenu: async (menuId: number, data: { recipeId: number; displayOrder?: number }) => {
        const response = await api.post(`/menus/${ menuId }/recipes`, data);
        return response.data;
    },
    removeRecipeFromMenu: async (menuId: number, recipeId: number): Promise<boolean> => {
        await api.delete(`/menus/${ menuId }/recipes/${ recipeId }`);
        return true;
    },
};

// Scheduled Meal API
export const scheduledMealApi = {
    create: async (dayId: number, data: CreateScheduledMealInput): Promise<ScheduledMeal> => {
        const response = await api.post(`/events/days/${ dayId }/meals`, data);
        return response.data;
    },
    update: async (mealId: number, data: UpdateScheduledMealInput): Promise<ScheduledMeal> => {
        const response = await api.put(`/scheduled-meals/${ mealId }`, data);
        return response.data;
    },
    delete: async (mealId: number): Promise<boolean> => {
        await api.delete(`/scheduled-meals/${ mealId }`);
        return true;
    },
    addRecipeToMeal: async (mealId: number, data: { recipeId: number }) => {
        const response = await api.post(`/scheduled-meals/${ mealId }/recipes`, data);
        return response.data;
    },
    removeRecipeFromMeal: async (mealId: number, recipeId: number): Promise<boolean> => {
        await api.delete(`/scheduled-meals/${ mealId }/recipes/${ recipeId }`);
        return true;
    },
    getAllForDay: async (dayId: number) => {
        console.log(`API: Fetching meals for day ${ dayId }`);
        try {
            const response = await api.get(`/events/days/${ dayId }/meals`);
            console.log(`API Response for day ${ dayId } meals:`, response.data);
            return response.data || [];
        } catch (error) {
            console.error(`API Error fetching meals for day ${ dayId }:`, error);
            throw error;
        }
    },
};

// Shopping List API
export const shoppingListApi = {
    getEventShoppingList: async (eventId: number): Promise<ShoppingListWithItems | null> => {
        try {
            console.log(`API: Fetching shopping list for event ${ eventId }`);
            const response = await api.get(`/events/${ eventId }/shopping-list`);
            return response.data;
        } catch (error) {
            if (isApiError(error) && error.response?.status === 404) {
                console.log(`No shopping list found for event ${ eventId }`);
                return null;
            }
            console.error(`API Error fetching shopping list for event ${ eventId }:`, error);
            throw error;
        }
    },
    generateEventShoppingList: async (eventId: number): Promise<ShoppingListWithItems> => {
        console.log(`API: Generating shopping list for event ${ eventId }`);
        const response = await api.put(`/events/${ eventId }/shopping-list`);
        return response.data;
    },
    updateShoppingListItem: async (itemId: number, data: Partial<ShoppingListItemData>): Promise<ShoppingListItemData> => {
        console.log(`API: Updating shopping list item ${ itemId } with data:`, data);
        const response = await api.put(`/shopping-lists/items/${ itemId }`, data);
        return response.data;
    },
    updateShoppingList: async (listId: number, data: Partial<ShoppingListData>): Promise<ShoppingListData> => {
        console.log(`API: Updating shopping list ${ listId } with data:`, data);
        const response = await api.put(`/shopping-lists/${ listId }`, data);
        return response.data;
    },
    getConsolidatedShoppingList: async (params: {
        startDate?: string;
        endDate?: string;
        eventIds?: number[];
        eventTypes?: string[];
        roundQuantities?: boolean;
    }): Promise<GroupedShoppingList> => {
        console.log(`API: Fetching consolidated shopping list with params:`, params);
        const response = await api.get(`/shopping-lists/consolidated`, { params });
        return response.data;
    }
};

// --- Authentication API with Enhanced Error Handling ---
export const authApi = {
    login: async (credentials: LoginInput): Promise<AuthResponse> => {
        try {
            console.log("API Client: Calling POST /auth/login");
            const response = await api.post('/auth/login', credentials);
            console.log("API Client: Login successful");
            return response.data;
        } catch (error) {
            console.error("API Client: Login failed:", getErrorMessage(error as ApiError));
            throw error;
        }
    },

    register: async (userData: RegisterInput): Promise<{ message: string; user: User }> => {
        try {
            console.log("API Client: Calling POST /auth/register");
            const response = await api.post('/auth/register', userData);
            console.log("API Client: Registration successful");
            return response.data;
        } catch (error) {
            console.error("API Client: Registration failed:", getErrorMessage(error as ApiError));
            throw error;
        }
    },

    getCurrentUser: async (): Promise<User> => {
        try {
            console.log("API Client: Calling GET /auth/me");
            const response = await api.get('/auth/me');
            console.log("API Client: Successfully fetched current user");
            return response.data;
        } catch (error) {
            console.error("API Client: Failed to fetch current user:", getErrorMessage(error as ApiError));
            throw error;
        }
    },

    logout: async (): Promise<void> => {
        try {
            console.log("API Client: Calling POST /auth/logout");
            await api.post('/auth/logout');
            console.log("API Client: Server logout successful");
        } catch (error) {
            console.warn("API Client: Server logout failed:", getErrorMessage(error as ApiError));
            // Don't throw - local logout should still proceed
        }
    },

    refreshToken: async (): Promise<AuthResponse> => {
        try {
            console.log("API Client: Calling POST /auth/refresh");
            const response = await api.post('/auth/refresh');
            console.log("API Client: Token refresh successful");
            return response.data;
        } catch (error) {
            console.error("API Client: Token refresh failed:", getErrorMessage(error as ApiError));
            throw error;
        }
    },
};

export default api;