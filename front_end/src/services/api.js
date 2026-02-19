import axios from 'axios';

// Dynamically determine the backend URL based on the current hostname
// This allows it to work on localhost and on the network (e.g. 192.168.x.x)
const getBaseUrl = () => {
    const hostname = window.location.hostname;
    return `http://${hostname}:5000/api`;
};

export const API_BASE_URL = getBaseUrl();

const api = axios.create({
    baseURL: API_BASE_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

api.interceptors.request.use(request => {
    console.log('Starting Request', request);
    return request;
});

api.interceptors.response.use(response => {
    console.log('Response:', response);
    return response;
}, error => {
    console.error('API Error:', error);
    return Promise.reject(error);
});


export const authService = {
    login: async (credentials) => {
        try {
            const response = await api.post('/login', credentials);
            return response;
        } catch (error) {
            throw error;
        }
    },
    register: async (userData) => {
        try {
            const response = await api.post('/register', userData);
            return response;
        } catch (error) {
            throw error;
        }
    },
    getCurrentUser: async () => {
        try {
            const response = await api.get('/user/me');
            return response;
        } catch (error) {
            throw error;
        }
    },
    logout: async () => {
        try {
            const response = await api.post('/logout');
            return response;
        } catch (error) {
            throw error;
        }
    }
};


export const itemService = {

    getAllItems: async (params) => {
        try {
            const response = await api.get('/items', { params });

            return { data: response.data.items };
        } catch (error) {
            console.error("API Error:", error);
            throw error;
        }
    },

    getUserItems: async () => {
        try {
            const response = await api.get('/user/items');
            return { data: response.data.items };
        } catch (error) {
            console.error("API Error:", error);
            throw error;
        }
    },
    getItemById: async (id) => {
        try {
            const response = await api.get(`/items/${id}`);
            return { data: response.data.item };
        } catch (error) {
            throw error;
        }
    },
    createItem: async (itemData) => {

        try {
            const config = {};
            if (itemData instanceof FormData) {
                config.headers = { 'Content-Type': 'multipart/form-data' };
            }
            const response = await api.post('/items', itemData, config);
            return { data: response.data.item };
        } catch (error) {
            throw error;
        }
    },
    updateItem: async (id, itemData) => {

        console.warn("Update Item not yet implemented on backend");
        return { data: { id, ...itemData } };
    },
    deleteItem: async (id) => {
        try {
            const response = await api.delete(`/items/${id}`);
            return response.data;
        } catch (error) {
            console.error("API Error:", error);
            throw error;
        }
    },
    getChats: async () => {
        try {
            const response = await api.get('/chats');
            return { data: response.data.chats };
        } catch (error) {
            console.error("API Error:", error);
            throw error;
        }
    }
};

export default api;
