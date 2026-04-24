// modulos/controlador.mjs
import modelo from './modelo.mjs';

// --- CONTROLADORES GALERÍA ---

async function obtenerGaleria(req, res) {
    try {
        const data = await modelo.obtenerGaleria();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener galería.", detalle: error.message });
    }
}

async function obtenerItemGaleria(req, res) {
    try {
        const id = parseInt(req.params.id);
        const item = await modelo.obtenerItemGaleria(id);
        item ? res.status(200).json(item) : res.status(404).json({ mensaje: 'Item no encontrado.' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener item.', detalle: error.message });
    }
}

async function agregarItemGaleria(req, res) {
    try {
        const nuevoItem = req.body;
        // Validación básica
        if (!nuevoItem.titulo || !nuevoItem.imagen) {
            return res.status(400).json({ mensaje: "Faltan datos (título o imagen)." });
        }
        const creado = await modelo.agregarItemGaleria(nuevoItem);
        res.status(201).json({ mensaje: "Item agregado a galería", item: creado });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al crear item.', detalle: error.message });
    }
}

async function modificarItemGaleria(req, res) {
    try {
        const id = parseInt(req.params.id);
        const dataNueva = req.body;
        
        // Obtenemos item viejo para borrar imagen si cambió
        const itemViejo = await modelo.obtenerItemGaleria(id);
        if (!itemViejo) return res.status(404).json({ mensaje: "Item no encontrado." });

        const modificado = await modelo.modificarItemGaleria(id, dataNueva);
        
        // Limpieza de imagen antigua si la URL cambió
        if (modificado && itemViejo.imagen && itemViejo.imagen !== dataNueva.imagen) {
            await modelo.eliminarImagenStorage(itemViejo.imagen);
        }

        res.status(200).json({ mensaje: "Item modificado." });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al modificar item.', detalle: error.message });
    }
}

async function eliminarItemGaleria(req, res) {
    try {
        const id = parseInt(req.params.id);
        const item = await modelo.obtenerItemGaleria(id);
        
        if (item && item.imagen) {
            await modelo.eliminarImagenStorage(item.imagen);
        }
        
        const eliminado = await modelo.eliminarItemGaleria(id);
        eliminado ? res.status(200).json({ mensaje: "Eliminado con éxito" }) 
                  : res.status(404).json({ mensaje: "No encontrado" });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar.', detalle: error.message });
    }
}

// --- CONTROLADORES PRÓXIMOS EVENTOS ---

// Admin: obtener todos los eventos (activos e inactivos)
async function obtenerTodosLosEventos(req, res) {
    try {
        const data = await modelo.obtenerTodosLosEventos();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener eventos.", detalle: error.message });
    }
}

// Público: obtener solo eventos activos
async function obtenerProximosEventos(req, res) {
    try {
        const data = await modelo.obtenerProximosEventos();
        res.status(200).json(data);
    } catch (error) {
        res.status(500).json({ mensaje: "Error al obtener eventos.", detalle: error.message });
    }
}

async function obtenerUnEvento(req, res) {
    try {
        const id = parseInt(req.params.id);
        const evento = await modelo.obtenerUnEvento(id);
        evento ? res.status(200).json(evento) : res.status(404).json({ mensaje: 'Evento no encontrado.' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error interno.', detalle: error.message });
    }
}

async function agregarEvento(req, res) {
    try {
        const nuevoEvento = req.body;
        if (!nuevoEvento.titulo || !nuevoEvento.fecha) {
            return res.status(400).json({ mensaje: "Título y fecha son obligatorios." });
        }
        const creado = await modelo.agregarEvento(nuevoEvento);
        res.status(201).json({ mensaje: "Evento creado", evento: creado });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al crear evento.', detalle: error.message });
    }
}

async function modificarEvento(req, res) {
    try {
        const id = parseInt(req.params.id);
        const eventoNuevo = req.body;

        const eventoViejo = await modelo.obtenerUnEvento(id);
        if (!eventoViejo) return res.status(404).json({ mensaje: "Evento no encontrado." });

        const modificado = await modelo.modificarEvento(id, eventoNuevo);

        // Lógica para borrar imágenes antiguas si cambiaron (Portada, Modal, Mapa)
        const imagenesAComparar = ['imagen_portada', 'imagen_modal', 'imagen_mapa_mesas'];
        
        for (const campo of imagenesAComparar) {
            const urlVieja = eventoViejo[campo];
            const urlNueva = eventoNuevo[campo];
            if (urlVieja && urlVieja !== urlNueva) {
                await modelo.eliminarImagenStorage(urlVieja);
            }
        }

        res.status(200).json({ mensaje: "Evento modificado." });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al modificar evento.', detalle: error.message });
    }
}

async function eliminarEvento(req, res) {
    try {
        const id = parseInt(req.params.id);
        const evento = await modelo.obtenerUnEvento(id);

        if (evento) {
            // Eliminar todas las imágenes asociadas
            if (evento.imagen_portada) await modelo.eliminarImagenStorage(evento.imagen_portada);
            if (evento.imagen_modal) await modelo.eliminarImagenStorage(evento.imagen_modal);
            if (evento.imagen_mapa_mesas) await modelo.eliminarImagenStorage(evento.imagen_mapa_mesas);
        }

        const eliminado = await modelo.eliminarEvento(id);
        eliminado ? res.status(200).json({ mensaje: "Evento eliminado." }) 
                  : res.status(404).json({ mensaje: "No encontrado." });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al eliminar.', detalle: error.message });
    }
}

// --- CONTROLADORES STORAGE (Genéricos) ---

async function subirImagen(req, res) {
    try {
        if (!req.file) return res.status(400).json({ mensaje: 'Falta archivo.' });
        const imageUrl = await modelo.subirImagenStorage(req.file.buffer, req.file);
        res.status(200).json({ mensaje: 'Imagen subida', imageUrl });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error subida.', detalle: error.message });
    }
}

async function eliminarImagen(req, res) {
    try {
        const { imageUrl } = req.body;
        if (!imageUrl) return res.status(400).json({ mensaje: 'Falta URL.' });
        await modelo.eliminarImagenStorage(imageUrl);
        res.status(200).json({ mensaje: 'Imagen eliminada.' });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error eliminación.', detalle: error.message });
    }
}

// --- CONTROLADORES CONFIG WEB ---

async function obtenerConfigWeb(req, res) {
    try {
        const config = await modelo.obtenerConfigWeb();
        res.status(200).json(config);
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al obtener config web.', detalle: error.message });
    }
}

async function guardarConfigWeb(req, res) {
    try {
        const campos = req.body;
        const camposPermitidos = ['hero_url', 'banner_url', 'instagram', 'spotify', 'soundcloud', 'whatsapp'];
        const camposFiltrados = Object.fromEntries(
            Object.entries(campos).filter(([k]) => camposPermitidos.includes(k))
        );
        if (Object.keys(camposFiltrados).length === 0) {
            return res.status(400).json({ mensaje: 'No se enviaron campos válidos.' });
        }
        const actualizado = await modelo.guardarConfigWeb(camposFiltrados);
        res.status(200).json({ mensaje: 'Config guardada.', config: actualizado });
    } catch (error) {
        res.status(500).json({ mensaje: 'Error al guardar config web.', detalle: error.message });
    }
}

export default {
    obtenerGaleria,
    obtenerItemGaleria,
    agregarItemGaleria,
    modificarItemGaleria,
    eliminarItemGaleria,
    obtenerTodosLosEventos,
    obtenerProximosEventos,
    obtenerUnEvento,
    agregarEvento,
    modificarEvento,
    eliminarEvento,
    subirImagen,
    eliminarImagen,
    obtenerConfigWeb,
    guardarConfigWeb
};