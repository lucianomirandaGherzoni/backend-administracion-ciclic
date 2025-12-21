import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import rutasApi from './modulos/rutas.mjs';

const app = express();
// Usamos process.env.PORT para que Vercel o tu hosting decidan el puerto, 
// o 3000 si estás en local.
const PUERTO = process.env.PORT || 3000; 


// Middleware
app.use(cors()); // Permitir conexiones desde otros dominios (tu frontend)
app.use(express.json()); // Habilita la lectura de JSON en el body
app.use(express.urlencoded({ extended: true })); // Habilita lectura de formularios

// Ruta raíz - Mensaje de bienvenida
app.get('/', (req, res) => {
    res.json({
        status: 'success',
        message: '🚀 Backend de Administración Ciclic funcionando correctamente',
        version: '1.0.0',
        endpoints: {
            login: '/api/v1/login',
            eventos: '/api/v1/eventos',
            galeria: '/api/v1/galeria',
            uploadImage: '/api/v1/upload-image',
            deleteImage: '/api/v1/delete-image'
        }
    });
});

// Montamos las rutas de la API
// Esto habilitará automáticamente:
// - /api/v1/galeria
// - /api/v1/eventos
// - /api/v1/upload-image
app.use(rutasApi);

// Iniciar servidor
app.listen(PUERTO, () => {
    console.log(`Servidor corriendo en puerto ${PUERTO}`);
});