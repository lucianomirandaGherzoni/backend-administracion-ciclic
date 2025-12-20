// js/controllers/admin.js
import { api } from '../services/api.js';
import { showToast, storage } from '../utils.js';

let itemAEliminar = null;
let tipoEntidad = null; // 'evento' o 'galeria'

document.addEventListener("DOMContentLoaded", async () => {
    // --- 1. SEGURIDAD: Verificar si el admin está logueado ---
    if (!storage.isAdminLoggedIn()) {
        window.location.href = "index.html";
        return;
    }

    // --- 2. CARGA INICIAL ---
    await cargarDatos();
    setupListeners();
});

// --- FUNCIONES DE CARGA DE DATOS ---

async function cargarDatos() {
    const cuerpoEventos = document.getElementById("cuerpo-tabla-eventos");
    const cuerpoGaleria = document.getElementById("cuerpo-tabla-galeria");

    // A. Cargar Eventos
    if (cuerpoEventos) {
        cuerpoEventos.innerHTML = "<tr><td colspan='5' class='texto-centro'>Cargando...</td></tr>";
        try {
            const eventos = await api.getEventos();
            
            if (!Array.isArray(eventos) || eventos.length === 0) {
                cuerpoEventos.innerHTML = "<tr><td colspan='5' class='texto-centro'>No hay eventos próximos</td></tr>";
                actualizarMetricas([]);
            } else {
                cuerpoEventos.innerHTML = eventos.map(e => {
                    const fechaFmt = new Date(e.fecha).toLocaleDateString('es-AR', {
                        day: '2-digit', month: '2-digit', year: 'numeric', 
                        hour: '2-digit', minute: '2-digit'
                    });
                    
                    const estado = e.activo 
                        ? '<span class="tag-alerta" style="border-color:#10b981; color:#065f46; background-color:#d1fae5;">Activo</span>' 
                        : '<span class="tag-alerta" style="border-color:#e5e7eb; color:#374151; background-color:#f3f4f6;">Oculto</span>';
                    
                    const imagenMostrada = e.imagen_portada || 'https://via.placeholder.com/50?text=No+Img';

                    return `
                    <tr>
                        <td>
                            <img src="${imagenMostrada}" style="width:50px; height:50px; object-fit:cover; border-radius:4px; border:1px solid #eee;">
                        </td>
                        <td style="font-weight:600;">${e.titulo}</td>
                        <td class="col-ocultar-movil">${fechaFmt}</td>
                        <td class="texto-centro col-ocultar-movil">${estado}</td>
                        <td class="texto-centro">
                            <div class="acciones">
                                <button class="boton boton-icono boton-contorno btn-edit-evt" data-id="${e.id}" title="Editar">✏️</button>
                                <button class="boton boton-icono boton-destructivo btn-del-evt" data-id="${e.id}" title="Eliminar">🗑️</button>
                            </div>
                        </td>
                    </tr>`;
                }).join("");
                
                actualizarMetricas(eventos);
            }
        } catch (e) {
            console.error(e);
            cuerpoEventos.innerHTML = "<tr><td colspan='5' class='texto-centro error'>Error de conexión con el servidor</td></tr>";
        }
    }

    // B. Cargar Galería
    if (cuerpoGaleria) {
        cuerpoGaleria.innerHTML = "<tr><td colspan='5' class='texto-centro'>Cargando...</td></tr>";
        try {
            const galeria = await api.getGaleria();
            
            if (!Array.isArray(galeria) || galeria.length === 0) {
                cuerpoGaleria.innerHTML = "<tr><td colspan='5' class='texto-centro'>La galería está vacía</td></tr>";
            } else {
                cuerpoGaleria.innerHTML = galeria.map(g => {
                    const fechaFmt = new Date(g.fecha).toLocaleDateString('es-AR', {timeZone: 'UTC'}); // Usar UTC para fechas puras
                    const imagenMostrada = g.imagen || 'https://via.placeholder.com/50?text=No+Img';

                    return `
                    <tr>
                        <td>
                            <img src="${imagenMostrada}" style="width:50px; height:50px; object-fit:cover; border-radius:4px; border:1px solid #eee;">
                        </td>
                        <td style="font-weight:600;">${g.titulo}</td>
                        <td class="col-ocultar-movil">${fechaFmt}</td>
                        <td class="col-ocultar-movil">
                            ${g.link_drive ? `<a href="${g.link_drive}" target="_blank" style="color:var(--naranja); font-weight:500;">Ver Drive <i class="ti ti-external-link"></i></a>` : '-'}
                        </td>
                        <td class="texto-centro">
                            <div class="acciones">
                                <button class="boton boton-icono boton-contorno btn-edit-gal" data-id="${g.id}" title="Editar">✏️</button>
                                <button class="boton boton-icono boton-destructivo btn-del-gal" data-id="${g.id}" title="Eliminar">🗑️</button>
                            </div>
                        </td>
                    </tr>`;
                }).join("");
                actualizarMetricasGaleria(galeria);
            }
        } catch (e) {
            console.error(e);
            cuerpoGaleria.innerHTML = "<tr><td colspan='5' class='texto-centro error'>Error al cargar galería</td></tr>";
        }
    }
}

function actualizarMetricasGaleria(galeria) {
    const label = document.getElementById("label-galeria-info");
    if (!label) return;

    const total = galeria.length;

    label.className = "stock-info-label ok";
    label.innerHTML = `
        <div style="display:flex; align-items:center; gap:0.75rem;">
            <span class="status-dot" style="background-color:#9ca3af"></span>
            <span style="font-weight:600;">Eventos Pasados</span>
        </div>
        <div class="status-divider"></div>
        <div class="status-metric">
            <span>Total: <strong>${total}</strong></span>
        </div>
    `;
}

function actualizarMetricas(eventos) {
    const label = document.getElementById("label-status-info");
    if (!label) return;

    const total = eventos.length;
    const activos = eventos.filter(e => e.activo).length;
    const inactivos = total - activos;

    label.className = "stock-info-label ok";
    label.innerHTML = `
        <div style="display:flex; align-items:center; gap:0.75rem;">
            <span class="status-dot" style="background-color:${activos > 0 ? '#10b981' : '#9ca3af'}"></span>
            <span style="font-weight:600;">Próximos Eventos</span>
        </div>
        <div class="status-divider"></div>
        <div class="status-metric">
            <span>Total: <strong>${total}</strong></span>
            <span style="opacity:0.3; margin:0 5px;">|</span>
            <span>Activos: <strong>${activos}</strong></span>
            <span style="opacity:0.3; margin:0 5px;">|</span>
            <span>Inactivos: <strong>${inactivos}</strong></span>
        </div>
    `;
}

// --- SETUP LISTENERS ---

function setupListeners() {
    // 1. Logout
    const btnLogout = document.getElementById("boton-logout-admin");
    if (btnLogout) {
        btnLogout.addEventListener("click", () => {
            storage.setAdminLogin(false);
            window.location.href = "index.html";
        });
    }

    // 2. Abrir Modales (Botones Principales)
    const btnAddEvent = document.getElementById("boton-agregar-evento");
    if (btnAddEvent) btnAddEvent.onclick = () => abrirModalEvento();

    const btnAddGaleria = document.getElementById("boton-agregar-galeria");
    if (btnAddGaleria) btnAddGaleria.onclick = () => abrirModalGaleria();

    // 3. Cerrar Modales
    document.querySelectorAll(".cerrar-modal, .close").forEach(btn => {
        btn.onclick = () => {
            document.querySelectorAll(".modal").forEach(m => m.style.display = "none");
        };
    });

    // 4. Submit Forms
    const formEvento = document.getElementById("formulario-crud-evento");
    if (formEvento) formEvento.addEventListener("submit", guardarEvento);

    const formGaleria = document.getElementById("formulario-crud-galeria");
    if (formGaleria) formGaleria.addEventListener("submit", guardarGaleria);

    // 5. Confirmar Eliminación
    const btnConfirmarEliminar = document.getElementById("btnEliminar");
    if (btnConfirmarEliminar) btnConfirmarEliminar.onclick = ejecutarEliminacion;

    // 6. Delegación de Eventos en Tablas (Editar y Eliminar)
    const tablaEventos = document.getElementById("cuerpo-tabla-eventos");
    if (tablaEventos) {
        tablaEventos.addEventListener("click", async (e) => {
            const btnEdit = e.target.closest(".btn-edit-evt");
            const btnDel = e.target.closest(".btn-del-evt");

            if (btnEdit) {
                const id = btnEdit.dataset.id;
                try {
                    // Opcional: Mostrar carga mientras trae el detalle
                    showToast("Cargando datos...", "info");
                    const evento = await api.getEvento(id);
                    abrirModalEvento(evento);
                } catch (err) {
                    showToast("Error cargando evento", "error");
                }
            }
            if (btnDel) {
                confirmarEliminar(btnDel.dataset.id, 'evento');
            }
        });
    }

    const tablaGaleria = document.getElementById("cuerpo-tabla-galeria");
    if (tablaGaleria) {
        tablaGaleria.addEventListener("click", async (e) => {
            const btnEdit = e.target.closest(".btn-edit-gal");
            const btnDel = e.target.closest(".btn-del-gal");

            if (btnEdit) {
                // Para galería, como ya tenemos los datos en la tabla, podríamos optimizar
                // pero por consistencia pedimos el listado o filtramos si lo tuvieramos en memoria global.
                // Aquí pedimos de nuevo el array completo (optimizable) o filtramos si guardamos en variable.
                const galeria = await api.getGaleria(); 
                const item = galeria.find(g => g.id == btnEdit.dataset.id);
                if (item) abrirModalGaleria(item);
            }
            if (btnDel) {
                confirmarEliminar(btnDel.dataset.id, 'galeria');
            }
        });
    }

    // 7. Previsualización de Imágenes
    setupImagePreview("file-portada", "img-preview-portada", "preview-portada-container");
    setupImagePreview("file-modal", "img-preview-modal", "preview-modal-container");
    setupImagePreview("file-mapa", "img-preview-mapa", "preview-mapa-container");
    setupImagePreview("file-galeria", "img-preview-galeria", "preview-galeria-container");

    // 7.1 Drag & Drop para todas las áreas de upload
    setupDragAndDrop("upload-portada", "file-portada");
    setupDragAndDrop("upload-modal", "file-modal");
    setupDragAndDrop("upload-mapa", "file-mapa");
    setupDragAndDrop("upload-galeria", "file-galeria");

    // 7.2 Toggle Switch dinámico
    setupToggleSwitch();

    // 8. Borrado manual de imágenes en el modal
    document.querySelectorAll(".btn-borrar-img-manual").forEach(btn => {
        btn.addEventListener("click", (e) => {
            const target = e.target.dataset.target; // 'portada', 'modal', 'mapa'
            // Limpiamos el hidden que guarda la URL actual
            const hiddenInput = document.getElementById(`url-${target}-actual`);
            if (hiddenInput) hiddenInput.value = "";
            
            // Limpiamos el input file
            const fileInput = document.getElementById(`file-${target}`);
            if (fileInput) fileInput.value = "";

            // Resetear el texto del nombre del archivo
            const fileNameSpan = document.getElementById(`file-name-${target}`);
            if (fileNameSpan) fileNameSpan.textContent = "Ningún archivo seleccionado";

            // Ocultamos la preview
            const container = document.getElementById(`preview-${target}-container`);
            if (container) container.style.display = "none";
        });
    });
}

// Helper para preview de imágenes
function setupImagePreview(inputId, imgId, containerId) {
    const input = document.getElementById(inputId);
    if (input) {
        input.addEventListener("change", (e) => {
            const file = e.target.files[0];
            if (file) {
                // Actualizar el nombre del archivo
                const target = inputId.replace('file-', '');
                const fileNameSpan = document.getElementById(`file-name-${target}`);
                if (fileNameSpan) {
                    fileNameSpan.textContent = file.name;
                }
                
                // Mostrar preview
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const img = document.getElementById(imgId);
                    const cont = document.getElementById(containerId);
                    if (img) img.src = ev.target.result;
                    if (cont) cont.style.display = "block";
                };
                reader.readAsDataURL(file);
            }
        });
    }
}

// Helper para drag & drop de imágenes
function setupDragAndDrop(uploadAreaId, fileInputId) {
    const uploadArea = document.getElementById(uploadAreaId);
    const fileInput = document.getElementById(fileInputId);
    
    if (!uploadArea || !fileInput) return;

    // Prevenir comportamiento por defecto
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, preventDefaults, false);
    });

    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Highlight cuando se arrastra sobre el área
    ['dragenter', 'dragover'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.add('drag-over');
        }, false);
    });

    ['dragleave', 'drop'].forEach(eventName => {
        uploadArea.addEventListener(eventName, () => {
            uploadArea.classList.remove('drag-over');
        }, false);
    });

    // Manejar el drop
    uploadArea.addEventListener('drop', (e) => {
        const dt = e.dataTransfer;
        const files = dt.files;

        if (files.length > 0) {
            fileInput.files = files;
            // Disparar el evento change manualmente
            const event = new Event('change', { bubbles: true });
            fileInput.dispatchEvent(event);
        }
    }, false);
}

// Helper para el toggle switch
function setupToggleSwitch() {
    const toggleCheckbox = document.getElementById('activo-evento');
    const toggleText = document.getElementById('toggle-text');
    const toggleStatus = document.getElementById('toggle-status');
    
    if (!toggleCheckbox || !toggleText || !toggleStatus) return;

    function updateToggleUI() {
        if (toggleCheckbox.checked) {
            toggleText.textContent = 'Evento Activo';
            toggleStatus.textContent = 'VISIBLE';
            toggleStatus.classList.remove('inactivo');
            toggleStatus.classList.add('activo');
        } else {
            toggleText.textContent = 'Evento Inactivo';
            toggleStatus.textContent = 'OCULTO';
            toggleStatus.classList.remove('activo');
            toggleStatus.classList.add('inactivo');
        }
    }

    toggleCheckbox.addEventListener('change', updateToggleUI);
    updateToggleUI(); // Inicializar estado
}

// --- LOGICA MODAL EVENTOS ---

function abrirModalEvento(evento = null) {
    const modal = document.getElementById("eventoModal");
    const form = document.getElementById("formulario-crud-evento");
    const titulo = document.getElementById("modalTituloEvento");

    if (!modal || !form) return;

    form.reset();
    // Ocultar todas las previews
    document.querySelectorAll("#eventoModal .preview-imagen").forEach(el => el.style.display = "none");
    
    // Limpiar inputs hidden
    document.getElementById("url-portada-actual").value = "";
    document.getElementById("url-modal-actual").value = "";
    document.getElementById("url-mapa-actual").value = "";

    if (evento) {
        titulo.textContent = "Editar Evento";
        document.getElementById("id-evento").value = evento.id;
        document.getElementById("titulo-evento").value = evento.titulo;
        document.getElementById("desc-evento").value = evento.descripcion || "";
        document.getElementById("iframe-evento").value = evento.iframe_mapa || "";
        document.getElementById("activo-evento").checked = evento.activo;

        // Formatear fecha para el input datetime-local (YYYY-MM-DDTHH:mm)
        if (evento.fecha) {
            const date = new Date(evento.fecha);
            // Ajuste de zona horaria local para que el input muestre la hora correcta
            const localIsoString = new Date(date.getTime() - (date.getTimezoneOffset() * 60000)).toISOString().slice(0, 16);
            document.getElementById("fecha-evento").value = localIsoString;
        }

        // Cargar imágenes existentes
        if (evento.imagen_portada) mostrarImagenPrevia("portada", evento.imagen_portada);
        if (evento.imagen_modal) mostrarImagenPrevia("modal", evento.imagen_modal);
        if (evento.imagen_mapa_mesas) mostrarImagenPrevia("mapa", evento.imagen_mapa_mesas);

    } else {
        titulo.textContent = "Nuevo Evento";
        document.getElementById("id-evento").value = "";
        document.getElementById("activo-evento").checked = true; // Por defecto activo
    }

    modal.style.display = "flex";
}

function mostrarImagenPrevia(tipo, url) {
    const img = document.getElementById(`img-preview-${tipo}`);
    const cont = document.getElementById(`preview-${tipo}-container`);
    const inputHidden = document.getElementById(`url-${tipo}-actual`);

    if (img && cont && inputHidden) {
        img.src = url;
        cont.style.display = "flex";
        inputHidden.value = url;
    }
}

async function guardarEvento(e) {
    e.preventDefault();
    const btn = document.getElementById("btnGuardarEvento");
    const spinner = document.getElementById("spinner-evento");
    const txt = document.getElementById("txt-guardar-evento");

    if (btn) btn.disabled = true;
    if (spinner) spinner.style.display = "inline-block";

    try {
        const id = document.getElementById("id-evento").value;

        // 1. Recopilar datos básicos
        const data = {
            titulo: document.getElementById("titulo-evento").value,
            fecha: document.getElementById("fecha-evento").value,
            descripcion: document.getElementById("desc-evento").value,
            iframe_mapa: document.getElementById("iframe-evento").value,
            activo: document.getElementById("activo-evento").checked,
            imagen_portada: document.getElementById("url-portada-actual").value,
            imagen_modal: document.getElementById("url-modal-actual").value,
            imagen_mapa_mesas: document.getElementById("url-mapa-actual").value
        };

        // 2. Subir imágenes nuevas EN PARALELO
        const filePortada = document.getElementById("file-portada").files[0];
        const fileModal = document.getElementById("file-modal").files[0];
        const fileMapa = document.getElementById("file-mapa").files[0];

        const uploadPromises = [];
        let totalImages = 0;
        
        if (filePortada) {
            totalImages++;
            uploadPromises.push(
                api.uploadImage(filePortada).then(up => {
                    data.imagen_portada = up.imageUrl;
                })
            );
        }
        if (fileModal) {
            totalImages++;
            uploadPromises.push(
                api.uploadImage(fileModal).then(up => {
                    data.imagen_modal = up.imageUrl;
                })
            );
        }
        if (fileMapa) {
            totalImages++;
            uploadPromises.push(
                api.uploadImage(fileMapa).then(up => {
                    data.imagen_mapa_mesas = up.imageUrl;
                })
            );
        }

        // Esperar a que todas las imágenes se suban
        if (uploadPromises.length > 0) {
            if (txt) txt.textContent = `Subiendo ${totalImages} imagen${totalImages > 1 ? 'es' : ''}...`;
            await Promise.all(uploadPromises);
        }

        // 3. Enviar al Backend
        if (txt) txt.textContent = "Guardando datos...";
        if (id) {
            await api.updateEvento(id, data);
            showToast("Evento actualizado correctamente");
        } else {
            await api.createEvento(data);
            showToast("Evento creado correctamente");
        }

        document.getElementById("eventoModal").style.display = "none";
        cargarDatos(); // Recargar tabla

    } catch (err) {
        console.error(err);
        showToast("Error: " + err.message, "error");
    } finally {
        if (btn) btn.disabled = false;
        if (spinner) spinner.style.display = "none";
        if (txt) txt.textContent = "Guardar Evento";
    }
}

// --- LOGICA MODAL GALERÍA ---

function abrirModalGaleria(item = null) {
    const modal = document.getElementById("galeriaModal");
    const form = document.getElementById("formulario-crud-galeria");
    const titulo = document.getElementById("modalTituloGaleria");

    if (!modal || !form) return;

    form.reset();
    document.getElementById("preview-galeria-container").style.display = "none";
    document.getElementById("url-galeria-actual").value = "";

    if (item) {
        titulo.textContent = "Editar Item Galería";
        document.getElementById("id-galeria").value = item.id;
        document.getElementById("titulo-galeria").value = item.titulo;
        document.getElementById("fecha-galeria").value = item.fecha; // El input date acepta YYYY-MM-DD directo
        document.getElementById("link-galeria").value = item.link_drive;

        if (item.imagen) {
            mostrarImagenPrevia("galeria", item.imagen);
        }
    } else {
        titulo.textContent = "Nuevo Item Galería";
        document.getElementById("id-galeria").value = "";
    }

    modal.style.display = "flex";
}

async function guardarGaleria(e) {
    e.preventDefault();
    const btn = document.getElementById("btnGuardarGaleria");
    const spinner = document.getElementById("spinner-galeria");
    const txt = document.getElementById("txt-guardar-galeria");

    if (btn) btn.disabled = true;
    if (spinner) spinner.style.display = "inline-block";
    if (txt) txt.textContent = "Guardando...";

    try {
        const id = document.getElementById("id-galeria").value;

        const data = {
            titulo: document.getElementById("titulo-galeria").value,
            fecha: document.getElementById("fecha-galeria").value,
            link_drive: document.getElementById("link-galeria").value,
            imagen: document.getElementById("url-galeria-actual").value
        };

        const file = document.getElementById("file-galeria").files[0];
        if (file) {
            const up = await api.uploadImage(file);
            data.imagen = up.imageUrl;
        }

        if (id) {
            await api.updateItemGaleria(id, data);
            showToast("Item actualizado");
        } else {
            await api.createItemGaleria(data);
            showToast("Item creado en galería");
        }

        document.getElementById("galeriaModal").style.display = "none";
        cargarDatos();

    } catch (err) {
        showToast("Error: " + err.message, "error");
    } finally {
        if (btn) btn.disabled = false;
        if (spinner) spinner.style.display = "none";
        if (txt) txt.textContent = "Guardar";
    }
}

// --- LOGICA DE ELIMINACIÓN ---

function confirmarEliminar(id, tipo) {
    itemAEliminar = id;
    tipoEntidad = tipo;
    const modal = document.getElementById("confirmarEliminarModal");
    const msj = document.getElementById("mensajeEliminar");
    
    if (msj) {
        msj.textContent = tipo === 'evento' 
            ? "¿Eliminar este evento y sus imágenes?" 
            : "¿Eliminar este item de la galería?";
    }
    
    if (modal) modal.style.display = "flex";
}

async function ejecutarEliminacion() {
    const btn = document.getElementById("btnEliminar");
    if (btn) {
        btn.disabled = true;
        btn.textContent = "Eliminando...";
    }

    try {
        if (tipoEntidad === 'evento') {
            await api.deleteEvento(itemAEliminar);
        } else if (tipoEntidad === 'galeria') {
            await api.deleteItemGaleria(itemAEliminar);
        }

        showToast("Eliminado correctamente");
        document.getElementById("confirmarEliminarModal").style.display = "none";
        cargarDatos();

    } catch (e) {
        showToast("Error al eliminar: " + e.message, "error");
    } finally {
        if (btn) {
            btn.disabled = false;
            btn.textContent = "Si, Eliminar";
        }
        itemAEliminar = null;
        tipoEntidad = null;
    }
}