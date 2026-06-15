// src/utils/apiService.js
import axios from 'axios';
import { showToast } from './toast';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://xoto.ae/api';

// ihfwierhvjfdnv;ioenv;ioeasnj


// Create axios instance dfdsgsdg

const api = axios.create({
    baseURL: API_BASE_URL,

});

// Request interceptor to add auth token
// 'grid_token' is set by the TypeScript auth system (VaultLogin/AuthContext)
// 'token'      is set by the legacy JavaScript auth system
// grid_token takes priority to ensure the correct active session is used
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('grid_token') || localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Response interceptor
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const token = localStorage.getItem('token');

        // YAHAN LOGIC CHANGE KIYA HAI
        if (token) {
            const errorData = error.response?.data;
            const errorMessage = errorData?.message || errorData?.error?.message || 'Something went wrong';

            // 1. :x: Suppress upgrade-limit message
            if (errorMessage?.toLowerCase().includes('generate more images')) {
                return Promise.reject(error);
            }

            // 2. :x: Suppress "Customer not found" message (Frontend hand-to-hand modal handles this)
            if (errorMessage === "Customer not found") {
                return Promise.reject(error);
            }

            // Baaki sabhi cases mein toast dikhao
            showToast(errorMessage, 'error');
        }

        return Promise.reject(error);
    }
);



export const apiService = {
    get: async (url, params = {}) => {
        const response = await api.get(url, { params });
        return response.data;
    },

    post: async (url, data) => {
        const response = await api.post(url, data);
        return response.data;
    },

    put: async (url, data) => {
        const response = await api.put(url, data);
        return response.data;
    },

    patch: async (url, data) => {
        const response = await api.patch(url, data);
        return response.data;
    },

    delete: async (url) => {
        const response = await api.delete(url);
        return response.data;
    },

    upload: async (url, formData, onUploadProgress) => {
        const response = await api.post(url, formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
            onUploadProgress,
        });
        return response.data;
    },

    download: async (url, fileName) => {
        const response = await api.get(url, { responseType: "blob" });

        const urlBlob = window.URL.createObjectURL(
            new Blob([response.data])
        );

        const link = document.createElement("a");
        link.href = urlBlob;
        link.setAttribute("download", fileName);
        document.body.appendChild(link);
        link.click();
        link.remove();

        return true;
    },
};