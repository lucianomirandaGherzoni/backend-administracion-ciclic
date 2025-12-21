import { CONFIG } from '../config.js';
import { storage, showToast } from '../utils.js';

document.addEventListener("DOMContentLoaded", () => {
    // Si ya está logueado, redirigir directo al panel
    if (storage.isAdminLoggedIn()) {
        window.location.href = "crud.html";
        return;
    }

    const form = document.getElementById("form-login");
    const submitBtn = form.querySelector('button[type="submit"]');
    
    form.addEventListener("submit", async (e) => {
        e.preventDefault();

        const user = document.getElementById("username").value.trim();
        const pass = document.getElementById("password").value.trim();

        if (!user || !pass) {
            showToast("Por favor ingresa usuario y contraseña", "error");
            return;
        }

        // Deshabilitar botón mientras se procesa
        submitBtn.disabled = true;
        submitBtn.textContent = "Verificando...";

        try {
            // Enviar credenciales al backend
            const response = await fetch(CONFIG.API_LOGIN, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    username: user,
                    password: pass
                })
            });

            const data = await response.json();

            if (response.ok && data.success) {
                // Login exitoso
                storage.setAdminLogin(true);
                showToast("Bienvenido a Ciclic", "exito");
                
                // Pequeño delay para ver la notificación
                setTimeout(() => {
                    window.location.href = "crud.html";
                }, 500);
            } else {
                // Login fallido
                showToast(data.message || "Credenciales incorrectas", "error");
                document.getElementById("password").value = ""; // Limpiar pass
                submitBtn.disabled = false;
                submitBtn.textContent = "Ingresar";
            }
        } catch (error) {
            console.error('Error en login:', error);
            showToast("Error al conectar con el servidor", "error");
            submitBtn.disabled = false;
            submitBtn.textContent = "Ingresar";
        }
    });
});