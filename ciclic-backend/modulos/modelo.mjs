// modulos/modelo.mjs
import { supabaseAdmin } from './supabaseClient.mjs';

// --- SECCIÓN: GALERÍA DE EVENTOS ---

async function obtenerGaleria() {
    try {
        const { data, error } = await supabaseAdmin
            .from('galeria_eventos')
            .select('*')
            .order('fecha', { ascending: false }); // Ordenar por fecha descendente

        if (error) throw error;
        return data;
    } catch (error) {
        throw error;
    }
}

async function obtenerItemGaleria(id) {
    try {
        const { data, error } = await supabaseAdmin
            .from('galeria_eventos')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        throw error;
    }
}

async function agregarItemGaleria(nuevoItem) {
    try {
        const { imagen, titulo, fecha, link_drive, activo } = nuevoItem;
        const { data, error } = await supabaseAdmin
            .from('galeria_eventos')
            .insert([{ imagen, titulo, fecha, link_drive, activo }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        throw error;
    }
}

async function modificarItemGaleria(id, itemModificar) {
    try {
        const { imagen, titulo, fecha, link_drive, activo } = itemModificar;
        const { data, error } = await supabaseAdmin
            .from('galeria_eventos')
            .update({ imagen, titulo, fecha, link_drive, activo })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        throw error;
    }
}

async function eliminarItemGaleria(id) {
    try {
        const { error, count } = await supabaseAdmin
            .from('galeria_eventos')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return count > 0;
    } catch (error) {
        throw error;
    }
}

// --- SECCIÓN: PRÓXIMOS EVENTOS ---

async function obtenerProximosEventos() {
    try {
        const { data, error } = await supabaseAdmin
            .from('proximos_eventos')
            .select('*')
            .order('fecha', { ascending: true }); // Los más cercanos primero

        if (error) throw error;
        return data;
    } catch (error) {
        throw error;
    }
}

async function obtenerUnEvento(id) {
    try {
        const { data, error } = await supabaseAdmin
            .from('proximos_eventos')
            .select('*')
            .eq('id', id)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        throw error;
    }
}

async function agregarEvento(nuevoEvento) {
    try {
        // Desestructuramos según tu esquema
        const { 
            titulo, fecha, descripcion, 
            imagen_portada, imagen_modal, imagen_mapa_mesas, 
            iframe_mapa, activo 
        } = nuevoEvento;

        const { data, error } = await supabaseAdmin
            .from('proximos_eventos')
            .insert([{
                titulo, fecha, descripcion,
                imagen_portada, imagen_modal, imagen_mapa_mesas,
                iframe_mapa, activo
            }])
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        throw error;
    }
}

async function modificarEvento(id, eventoModificar) {
    try {
        const { 
            titulo, fecha, descripcion, 
            imagen_portada, imagen_modal, imagen_mapa_mesas, 
            iframe_mapa, activo 
        } = eventoModificar;

        const { data, error } = await supabaseAdmin
            .from('proximos_eventos')
            .update({
                titulo, fecha, descripcion,
                imagen_portada, imagen_modal, imagen_mapa_mesas,
                iframe_mapa, activo,
                updated_at: new Date() // Actualizamos timestamp
            })
            .eq('id', id)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        throw error;
    }
}

async function eliminarEvento(id) {
    try {
        const { error, count } = await supabaseAdmin
            .from('proximos_eventos')
            .delete()
            .eq('id', id);

        if (error) throw error;
        return count > 0;
    } catch (error) {
        throw error;
    }
}

// --- SECCIÓN: STORAGE (Imágenes) ---
// Mantenemos la lógica original ya que es genérica y funciona bien

async function subirImagenStorage(fileBuffer, originalFile) {
    try {
        const SUPABASE_BUCKET_NAME = process.env.SUPABASE_BUCKET_NAME || 'CICLIC-CONTENT'; // Cambia el bucket si deseas
        const fileExt = originalFile.originalname.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error } = await supabaseAdmin.storage
            .from(SUPABASE_BUCKET_NAME)
            .upload(filePath, fileBuffer, {
                contentType: originalFile.mimetype,
                upsert: false
            });

        if (error) throw new Error(`Error subida Storage: ${error.message}`);

        const { data: publicUrlData } = supabaseAdmin.storage
            .from(SUPABASE_BUCKET_NAME)
            .getPublicUrl(filePath);

        return publicUrlData.publicUrl;
    } catch (error) {
        throw error;
    }
}

async function eliminarImagenStorage(imageUrl) {
    if (!imageUrl) return;
    try {
        const SUPABASE_BUCKET_NAME = process.env.SUPABASE_BUCKET_NAME || 'imagenes-eventos';
        const urlParts = imageUrl.split('/');
        const bucketIndex = urlParts.indexOf(SUPABASE_BUCKET_NAME);
        
        if (bucketIndex === -1 || bucketIndex + 1 >= urlParts.length) return;
        
        const filePathInBucket = urlParts.slice(bucketIndex + 1).join('/');

        await supabaseAdmin.storage
            .from(SUPABASE_BUCKET_NAME)
            .remove([filePathInBucket]);
    } catch (error) {
        // Ignorar errores al eliminar imágenes
    }
}

export default {
    // Galería
    obtenerGaleria,
    obtenerItemGaleria,
    agregarItemGaleria,
    modificarItemGaleria,
    eliminarItemGaleria,
    // Próximos Eventos
    obtenerProximosEventos,
    obtenerUnEvento,
    agregarEvento,
    modificarEvento,
    eliminarEvento,
    // Storage
    subirImagenStorage,
    eliminarImagenStorage
};