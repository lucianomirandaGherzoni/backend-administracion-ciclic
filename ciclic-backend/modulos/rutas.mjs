// modulos/rutas.mjs
import { Router } from 'express';
import controlador from './controlador.mjs';
import { login } from './auth.mjs';
import multer from 'multer';

const rutasApi = Router();
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// --- Ruta de Autenticación ---
rutasApi.post('/api/v1/login', login);

// --- Rutas Galería ---
rutasApi.get('/api/v1/galeria', controlador.obtenerGaleria);
rutasApi.get('/api/v1/galeria/:id', controlador.obtenerItemGaleria);
rutasApi.post('/api/v1/galeria', controlador.agregarItemGaleria);
rutasApi.put('/api/v1/galeria/:id', controlador.modificarItemGaleria);
rutasApi.delete('/api/v1/galeria/:id', controlador.eliminarItemGaleria);

// --- Rutas Próximos Eventos ---
rutasApi.get('/api/v1/eventos-admin', controlador.obtenerTodosLosEventos); // Admin: todos los eventos
rutasApi.get('/api/v1/eventos', controlador.obtenerProximosEventos); // Público: solo activos
rutasApi.get('/api/v1/eventos/:id', controlador.obtenerUnEvento);
rutasApi.post('/api/v1/eventos', controlador.agregarEvento);
rutasApi.put('/api/v1/eventos/:id', controlador.modificarEvento);
rutasApi.delete('/api/v1/eventos/:id', controlador.eliminarEvento);

// --- Rutas Storage (Imágenes) ---
// Sirve para ambos cruds. El frontend sube la imagen, obtiene la URL y luego crea el evento/galería.
rutasApi.post('/api/v1/upload-image', upload.single('image'), controlador.subirImagen);
rutasApi.delete('/api/v1/delete-image', controlador.eliminarImagen);

// --- Rutas Config Web ---
rutasApi.get('/api/v1/config-web', controlador.obtenerConfigWeb);
rutasApi.patch('/api/v1/config-web', controlador.guardarConfigWeb);

export default rutasApi;