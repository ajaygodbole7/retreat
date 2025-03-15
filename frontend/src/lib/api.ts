import axios from 'axios';

// Create axios instance with base URL and default headers
const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
});

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

export default api;