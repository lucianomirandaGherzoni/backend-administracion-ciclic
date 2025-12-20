export const CONFIG = {
    // --- MODO LOCAL (Usar esto mientras programas en tu PC) ---
    API_BASE_URL_EVENTOS: "http://localhost:3000/api/v1/eventos",
    API_BASE_URL_GALERIA: "http://localhost:3000/api/v1/galeria",
    API_UPLOAD_IMAGE: "http://localhost:3000/api/v1/upload-image",
    API_DELETE_IMAGE: "http://localhost:3000/api/v1/delete-image",

    // --- MODO PRODUCCIÓN (Descomentar y comentar lo de arriba cuando subas a Vercel) ---
    // API_BASE_URL_EVENTOS: "https://ciclic-demo-v1.vercel.app/api/v1/eventos",
    // API_BASE_URL_GALERIA: "https://ciclic-demo-v1.vercel.app/api/v1/galeria",
    // API_UPLOAD_IMAGE: "https://ciclic-demo-v1.vercel.app/api/v1/upload-image",
    // API_DELETE_IMAGE: "https://ciclic-demo-v1.vercel.app/api/v1/delete-image",
    
    // Credenciales de Admin
    ADMIN_USERNAME: "ciclic",
    ADMIN_PASSWORD: "adminciclic2025", 
    STORAGE_KEY_ADMIN: "is_ciclic_admin_logged_in"
};