export const CONFIG = {
    // --- MODO LOCAL (Usar esto mientras programas en tu PC) ---
    // API_BASE_URL_EVENTOS: "http://localhost:3000/api/v1/eventos",
    // API_BASE_URL_EVENTOS_ADMIN: "http://localhost:3000/api/v1/eventos-admin",
    // API_BASE_URL_GALERIA: "http://localhost:3000/api/v1/galeria",
    // API_UPLOAD_IMAGE: "http://localhost:3000/api/v1/upload-image",
    // API_DELETE_IMAGE: "http://localhost:3000/api/v1/delete-image",
    // API_LOGIN: "http://localhost:3000/api/v1/login",

    // --- MODO PRODUCCIÓN (Descomentar y comentar lo de arriba cuando subas a Vercel) ---
    API_BASE_URL_EVENTOS: "https://backend-administracion-ciclic.vercel.app/api/v1/eventos",
    API_BASE_URL_EVENTOS_ADMIN: "https://backend-administracion-ciclic.vercel.app/api/v1/eventos-admin",
    API_BASE_URL_GALERIA: "https://backend-administracion-ciclic.vercel.app/api/v1/galeria",
    API_UPLOAD_IMAGE: "https://backend-administracion-ciclic.vercel.app/api/v1/upload-image",
    API_DELETE_IMAGE: "https://backend-administracion-ciclic.vercel.app/api/v1/delete-image",
    API_LOGIN: "https://backend-administracion-ciclic.vercel.app/api/v1/login",
    
    // Configuración de sesión
    STORAGE_KEY_ADMIN: "is_ciclic_admin_logged_in"
};