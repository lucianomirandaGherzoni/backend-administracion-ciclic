// --- utils.js ---

import { CONFIG } from './config.js';

export function formatearPrecio(valor) {
    return new Intl.NumberFormat("es-AR").format(valor);
}

export function showToast(message, type = "exito") {
    const toastContainer = document.getElementById("contenedor-notificaciones");
    if (!toastContainer) return;

    const toast = document.createElement("div");
    toast.classList.add("notificacion", type, "mostrar");
    toast.textContent = message;
    toastContainer.appendChild(toast);

    setTimeout(() => {
        toast.classList.remove("mostrar");
        toast.remove();
    }, 3000);
}

// --- FIX DEL ERROR: Manejo seguro del Storage ---
export const storage = {
    getCart: () => {
        try {
            const stored = localStorage.getItem(CONFIG.STORAGE_KEY_CARRITO);
            const parsed = stored ? JSON.parse(stored) : [];
            // Si lo que recuperamos NO es un array, devolvemos array vacío para evitar el .reduce error
            return Array.isArray(parsed) ? parsed : [];
        } catch (e) {
            console.error("Error leyendo carrito, reiniciando...", e);
            return [];
        }
    },
    setCart: (items) => {
        localStorage.setItem(CONFIG.STORAGE_KEY_CARRITO, JSON.stringify(items));
    },
    isAdminLoggedIn: () => {
        return localStorage.getItem(CONFIG.STORAGE_KEY_ADMIN) === "true";
    },
    setAdminLogin: (status) => {
        if(status) localStorage.setItem(CONFIG.STORAGE_KEY_ADMIN, "true");
        else localStorage.removeItem(CONFIG.STORAGE_KEY_ADMIN);
    }
};