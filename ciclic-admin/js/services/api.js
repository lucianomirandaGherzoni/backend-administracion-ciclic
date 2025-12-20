// js/services/api.js
import { CONFIG } from '../config.js';

async function request(url, options = {}) {
    const response = await fetch(url, options);
    if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || `Error HTTP: ${response.status}`);
    }
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
        return await response.json();
    }
    return {}; 
}

export const api = {
    // --- EVENTOS ---
    getEventos: async () => {
        try {
            return await request(`${CONFIG.API_BASE_URL_EVENTOS}?_=${Date.now()}`);
        } catch (error) {
            console.warn("API Eventos:", error);
            return [];
        }
    },
    getEvento: (id) => request(`${CONFIG.API_BASE_URL_EVENTOS}/${id}`),
    createEvento: (data) => request(CONFIG.API_BASE_URL_EVENTOS, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
    }),
    updateEvento: (id, data) => request(`${CONFIG.API_BASE_URL_EVENTOS}/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
    }),
    deleteEvento: (id) => request(`${CONFIG.API_BASE_URL_EVENTOS}/${id}`, { method: "DELETE" }),

    // --- GALERÍA ---
    getGaleria: async () => {
        try {
            return await request(`${CONFIG.API_BASE_URL_GALERIA}?_=${Date.now()}`);
        } catch (error) {
            console.warn("API Galería:", error);
            return [];
        }
    },
    createItemGaleria: (data) => request(CONFIG.API_BASE_URL_GALERIA, {
        method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
    }),
    updateItemGaleria: (id, data) => request(`${CONFIG.API_BASE_URL_GALERIA}/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(data)
    }),
    deleteItemGaleria: (id) => request(`${CONFIG.API_BASE_URL_GALERIA}/${id}`, { method: "DELETE" }),

    // --- IMÁGENES (Genérico) ---
    uploadImage: async (file) => {
        const formData = new FormData();
        formData.append("image", file);
        // Usamos la URL específica definida en config
        const res = await fetch(CONFIG.API_UPLOAD_IMAGE, { method: "POST", body: formData });
        if(!res.ok) throw new Error("Error subiendo imagen");
        return await res.json();
    },
    deleteImage: async (imageUrl) => {
        await fetch(CONFIG.API_DELETE_IMAGE, {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ imageUrl })
        });
    }
};