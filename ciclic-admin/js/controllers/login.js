import { CONFIG } from '../config.js';
import { storage, showToast } from '../utils.js';

document.addEventListener("DOMContentLoaded", () => {
    // Si ya está logueado, redirigir directo al panel
    if (storage.isAdminLoggedIn()) {
        window.location.href = "crud.html";
        return;
    }

    const form = document.getElementById("form-login");
    
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        const user = document.getElementById("username").value.trim();
        const pass = document.getElementById("password").value.trim();

        // Validación simple contra config.js
        if (user === CONFIG.ADMIN_USERNAME && pass === CONFIG.ADMIN_PASSWORD) {
            // Login exitoso
            storage.setAdminLogin(true);
            showToast("Bienvenido a Ciclic", "exito");
            
            // Pequeño delay para ver la notificación
            setTimeout(() => {
                window.location.href = "crud.html";
            }, 500);
        } else {
            // Login fallido
            showToast("Credenciales incorrectas", "error");
            document.getElementById("password").value = ""; // Limpiar pass
        }
    });
});