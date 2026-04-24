// js/controllers/admin.js
import { api } from '../services/api.js';
import { showToast, storage } from '../utils.js';

let itemAEliminar = null;
let tipoEntidad = null;

// Cache de datos para el dashboard
let _cachEventos = [];
let _cachGaleria = [];

document.addEventListener("DOMContentLoaded", async () => {
    // --- 1. SEGURIDAD ---
    if (!storage.isAdminLoggedIn()) {
        window.location.href = "index.html";
        return;
    }

    // --- 2. SETUP UI ---
    setupModuleNavigation();
    setupSidebarMobile();

    // --- 3. CARGA INICIAL ---
    await cargarDatos();
    setupListeners();
    setupGestionWeb();
    cargarConfigWeb();
});

// ============================================================
//  NAVEGACIÓN DE MÓDULOS
// ============================================================

const MODULE_TITLES = {
    dashboard: 'Dashboard',
    eventos: 'Eventos',
    galeria: 'Galería',
    web: 'Gestión Web'
};

function setupModuleNavigation() {
    const navItems = document.querySelectorAll('.sidebar-nav-item[data-module]');
    navItems.forEach(item => {
        item.addEventListener('click', () => {
            switchModule(item.dataset.module);
        });
    });

    // Botones "Ver todos" del dashboard
    document.querySelectorAll('.widget-link-btn[data-goto]').forEach(btn => {
        btn.addEventListener('click', () => switchModule(btn.dataset.goto));
    });
}

function switchModule(moduleName) {
    // Ocultar todos los módulos
    document.querySelectorAll('.module').forEach(m => {
        m.classList.remove('module-active');
    });

    // Activar módulo destino
    const target = document.getElementById(`module-${moduleName}`);
    if (target) target.classList.add('module-active');

    // Actualizar nav
    document.querySelectorAll('.sidebar-nav-item[data-module]').forEach(item => {
        item.classList.toggle('active', item.dataset.module === moduleName);
    });

    // Actualizar título del topbar
    const titleEl = document.getElementById('topbar-title');
    if (titleEl) titleEl.textContent = MODULE_TITLES[moduleName] || moduleName;

    // Scroll al inicio del contenido
    const content = document.querySelector('.dashboard-content');
    if (content) content.scrollTop = 0;
}

// ============================================================
//  SIDEBAR MOBILE
// ============================================================

function setupSidebarMobile() {
    const toggleBtn = document.getElementById('sidebar-toggle');
    const sidebar   = document.getElementById('sidebar');
    const overlay   = document.getElementById('sidebar-overlay');

    if (!toggleBtn || !sidebar || !overlay) return;

    function openSidebar() {
        sidebar.classList.add('sidebar-open');
        overlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeSidebar() {
        sidebar.classList.remove('sidebar-open');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    toggleBtn.addEventListener('click', openSidebar);
    overlay.addEventListener('click', closeSidebar);

    // Cerrar al navegar (mobile)
    document.querySelectorAll('.sidebar-nav-item').forEach(item => {
        item.addEventListener('click', () => {
            if (window.innerWidth <= 768) closeSidebar();
        });
    });
}

// ============================================================
//  FUNCIONES DE CARGA DE DATOS
// ============================================================

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
                        ? '<span class="widget-item-badge badge-activo">Activo</span>' 
                        : '<span class="widget-item-badge badge-inactivo">Oculto</span>';
                    
                    const imagenMostrada = e.imagen_portada || 'https://via.placeholder.com/50?text=No+Img';

                    return `
                    <tr>
                        <td>
                            <img src="${imagenMostrada}" style="width:44px; height:44px; object-fit:cover; border-radius:6px; border:1px solid #f0f0f0;">
                        </td>
                        <td style="font-weight:600;">${e.titulo}</td>
                        <td class="col-ocultar-movil">${fechaFmt}</td>
                        <td class="texto-centro col-ocultar-movil">${estado}</td>
                        <td class="texto-centro">
                            <div class="acciones">
                                <button class="boton boton-icono boton-contorno btn-edit-evt" data-id="${e.id}" title="Editar"><i class="ti ti-pencil"></i></button>
                                <button class="boton boton-icono boton-destructivo btn-del-evt" data-id="${e.id}" title="Eliminar"><i class="ti ti-trash"></i></button>
                            </div>
                        </td>
                    </tr>`;
                }).join("");
                
                _cachEventos = eventos;
                actualizarMetricas(eventos);
                actualizarDashboard();
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
                    const fechaFmt = new Date(g.fecha).toLocaleDateString('es-AR', {timeZone: 'UTC'});
                    const imagenMostrada = g.imagen || 'https://via.placeholder.com/50?text=No+Img';

                    return `
                    <tr>
                        <td>
                            <img src="${imagenMostrada}" style="width:44px; height:44px; object-fit:cover; border-radius:6px; border:1px solid #f0f0f0;">
                        </td>
                        <td style="font-weight:600;">${g.titulo}</td>
                        <td class="col-ocultar-movil">${fechaFmt}</td>
                        <td class="col-ocultar-movil">
                            ${g.link_drive ? `<a href="${g.link_drive}" target="_blank" style="color:var(--naranja); font-weight:500;">Ver Drive <i class="ti ti-external-link"></i></a>` : '-'}
                        </td>
                        <td class="texto-centro">
                            <div class="acciones">
                                <button class="boton boton-icono boton-contorno btn-edit-gal" data-id="${g.id}" title="Editar"><i class="ti ti-pencil"></i></button>
                                <button class="boton boton-icono boton-destructivo btn-del-gal" data-id="${g.id}" title="Eliminar"><i class="ti ti-trash"></i></button>
                            </div>
                        </td>
                    </tr>`;
                }).join("");
                _cachGaleria = galeria;
                actualizarMetricasGaleria(galeria);
                actualizarDashboard();
            }
        } catch (e) {
            console.error(e);
            cuerpoGaleria.innerHTML = "<tr><td colspan='5' class='texto-centro error'>Error al cargar galería</td></tr>";
        }
    }
}

function actualizarMetricasGaleria(galeria) {
    const label = document.getElementById("label-galeria-info");
    if (label) {
        const total = galeria.length;
        label.className = "module-metric-badge";
        label.innerHTML = `<span class="status-dot" style="background-color:#9ca3af"></span>${total} foto${total !== 1 ? 's' : ''} en galería`;
    }
    const badge = document.getElementById('sidebar-badge-galeria');
    if (badge) badge.textContent = galeria.length;
}

function actualizarMetricas(eventos) {
    const label = document.getElementById("label-status-info");
    if (label) {
        const total = eventos.length;
        const activos = eventos.filter(e => e.activo).length;
        label.className = "module-metric-badge";
        label.innerHTML = `<span class="status-dot"></span>${activos} activo${activos !== 1 ? 's' : ''} · ${total} total`;
    }
    const badge = document.getElementById('sidebar-badge-eventos');
    if (badge) badge.textContent = eventos.length;
}

// ============================================================
//  DASHBOARD STATS + WIDGETS
// ============================================================

function actualizarDashboard() {
    const eventos = _cachEventos;
    const galeria = _cachGaleria;

    // Stats
    const totalEl   = document.getElementById('stat-val-total');
    const activosEl = document.getElementById('stat-val-activos');
    const galeriaEl = document.getElementById('stat-val-galeria');
    const proximoEl = document.getElementById('stat-val-proximo');

    if (totalEl)   totalEl.textContent   = eventos.length;
    if (activosEl) activosEl.textContent = eventos.filter(e => e.activo).length;
    if (galeriaEl) galeriaEl.textContent = galeria.length;

    if (proximoEl) {
        const activos = eventos
            .filter(e => e.activo && e.fecha)
            .sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

        if (activos.length > 0) {
            const next = activos[0];
            proximoEl.textContent = next.titulo;
            proximoEl.classList.add('stat-val-sm');
        } else {
            proximoEl.textContent = '—';
        }
    }

    // Widget Eventos
    renderWidgetEventos(eventos.slice(0, 5));

    // Widget Galería
    renderWidgetGaleria(galeria.slice(0, 5));
}

function renderWidgetEventos(eventos) {
    const list = document.getElementById('widget-eventos-list');
    if (!list) return;

    if (!eventos || eventos.length === 0) {
        list.innerHTML = '<div class="widget-empty">No hay eventos cargados</div>';
        return;
    }

    list.innerHTML = eventos.map(e => {
        const fecha = e.fecha ? new Date(e.fecha).toLocaleDateString('es-AR', {day:'2-digit', month:'short', year:'numeric'}) : '';
        const badge = e.activo
            ? '<span class="widget-item-badge badge-activo">Activo</span>'
            : '<span class="widget-item-badge badge-inactivo">Oculto</span>';
        const img = e.imagen_portada
            ? `<img src="${e.imagen_portada}" alt="${e.titulo}" class="widget-item-img">`
            : `<div class="widget-item-img-placeholder"><i class="ti ti-calendar"></i></div>`;

        return `
        <div class="widget-item">
            ${img}
            <div class="widget-item-body">
                <div class="widget-item-title">${e.titulo}</div>
                <div class="widget-item-sub">${fecha}</div>
            </div>
            ${badge}
        </div>`;
    }).join('');
}

function renderWidgetGaleria(galeria) {
    const list = document.getElementById('widget-galeria-list');
    if (!list) return;

    if (!galeria || galeria.length === 0) {
        list.innerHTML = '<div class="widget-empty">No hay fotos en galería</div>';
        return;
    }

    list.innerHTML = galeria.map(g => {
        const fecha = g.fecha ? new Date(g.fecha).toLocaleDateString('es-AR', {timeZone:'UTC', day:'2-digit', month:'short', year:'numeric'}) : '';
        const img = g.imagen
            ? `<img src="${g.imagen}" alt="${g.titulo}" class="widget-item-img">`
            : `<div class="widget-item-img-placeholder"><i class="ti ti-photo"></i></div>`;

        return `
        <div class="widget-item">
            ${img}
            <div class="widget-item-body">
                <div class="widget-item-title">${g.titulo}</div>
                <div class="widget-item-sub">${fecha}</div>
            </div>
        </div>`;
    }).join('');
}

// ============================================================
//  SETUP LISTENERS
// ============================================================

function setupListeners() {
    // 1. Logout (sidebar)
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
            // Restaurar scroll del body
            document.body.classList.remove('modal-open');
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
    
    // Limpiar y ocultar todas las previews de imágenes
    const tiposImagen = ['portada', 'modal', 'mapa'];
    tiposImagen.forEach(tipo => {
        // Ocultar contenedor de preview
        const previewContainer = document.getElementById(`preview-${tipo}-container`);
        if (previewContainer) previewContainer.style.display = "none";
        
        // Limpiar la imagen de preview
        const imgPreview = document.getElementById(`img-preview-${tipo}`);
        if (imgPreview) imgPreview.src = "";
        
        // Limpiar el input hidden de URL actual
        const urlActual = document.getElementById(`url-${tipo}-actual`);
        if (urlActual) urlActual.value = "";
        
        // Limpiar el input de archivo
        const fileInput = document.getElementById(`file-${tipo}`);
        if (fileInput) fileInput.value = "";
        
        // Limpiar el texto del nombre de archivo
        const fileName = document.getElementById(`file-name-${tipo}`);
        if (fileName) fileName.textContent = "Ningún archivo seleccionado";
    });

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
    // Bloquear scroll del body
    document.body.classList.add('modal-open');
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
        document.body.classList.remove('modal-open');
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
    
    // Limpiar y ocultar preview de galería
    const previewContainer = document.getElementById("preview-galeria-container");
    if (previewContainer) previewContainer.style.display = "none";
    
    const imgPreview = document.getElementById("img-preview-galeria");
    if (imgPreview) imgPreview.src = "";
    
    const urlActual = document.getElementById("url-galeria-actual");
    if (urlActual) urlActual.value = "";
    
    const fileInput = document.getElementById("file-galeria");
    if (fileInput) fileInput.value = "";
    
    const fileName = document.getElementById("file-name-galeria");
    if (fileName) fileName.textContent = "Ningún archivo seleccionado";

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
    // Bloquear scroll del body
    document.body.classList.add('modal-open');
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
        document.body.classList.remove('modal-open');
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
    
    if (modal) {
        modal.style.display = "flex";
        // Bloquear scroll del body
        document.body.classList.add('modal-open');
    }
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
        document.body.classList.remove('modal-open');
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

// ============================================================
//  GESTIÓN WEB — Hero, Tickets, Redes Sociales
// ============================================================

async function cargarConfigWeb() {
    try {
        const config = await api.getConfigWeb();
        if (!config) return;

        if (config.hero_url)   mostrarPreviewWeb('hero',    config.hero_url);
        if (config.banner_url) mostrarPreviewWeb('tickets', config.banner_url);

        const mapa = { instagram: config.instagram, spotify: config.spotify, soundcloud: config.soundcloud, whatsapp: config.whatsapp };
        Object.entries(mapa).forEach(([red, val]) => {
            const input = document.getElementById(`config-${red}`);
            if (input && val) input.value = val;
        });
    } catch (err) {
        console.warn('No se pudo cargar config web:', err);
    }
}

function mostrarPreviewWeb(tipo, url, isVideo = false) {
    const wrap = document.getElementById(`wrap-preview-${tipo}`);
    if (!wrap) return;

    // Auto-detectar video por extensión de URL si no se indicó explícitamente
    if (!isVideo) {
        const ext = url.split('?')[0].split('.').pop().toLowerCase();
        isVideo = ['mp4', 'webm', 'ogg', 'mov', 'avi'].includes(ext);
    }

    if (isVideo) {
        wrap.innerHTML = `<video src="${url}" autoplay muted loop playsinline style="width:100%; height:160px; object-fit:cover; display:block;"></video>`;
    } else {
        wrap.innerHTML = `<img src="${url}" alt="Preview ${tipo}" style="width:100%; height:160px; object-fit:cover; display:block;">`;
    }
}

function setupGestionWeb() {
    setupWebUpload('hero',    'file-hero-web',    'file-name-hero-web',    'upload-hero-web',    'btn-guardar-hero');
    setupWebUpload('tickets', 'file-tickets-web', 'file-name-tickets-web', 'upload-tickets-web', 'btn-guardar-tickets');

    const btnRedes = document.getElementById('btn-guardar-redes');
    if (btnRedes) {
        btnRedes.addEventListener('click', async () => {
            const campos = {};
            ['instagram', 'spotify', 'soundcloud', 'whatsapp'].forEach(red => {
                const input = document.getElementById(`config-${red}`);
                if (input) campos[red] = input.value.trim();
            });
            try {
                await api.saveConfigWeb(campos);
                showToast('Redes sociales guardadas');
            } catch (err) {
                showToast('Error al guardar redes: ' + err.message, 'error');
            }
        });
    }
}

function setupWebUpload(tipo, fileInputId, fileNameId, uploadAreaId, saveBtnId) {
    const fileInput  = document.getElementById(fileInputId);
    const saveBtn    = document.getElementById(saveBtnId);
    const uploadArea = document.getElementById(uploadAreaId);

    if (!fileInput || !saveBtn) return;

    if (uploadArea) {
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('drag-over');
        });
        uploadArea.addEventListener('dragleave', () => uploadArea.classList.remove('drag-over'));
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('drag-over');
            const file = e.dataTransfer.files[0];
            if (file && (file.type.startsWith('image/') || file.type.startsWith('video/'))) {
                const dt = new DataTransfer();
                dt.items.add(file);
                fileInput.files = dt.files;
                mostrarPreviewWeb(tipo, URL.createObjectURL(file), file.type.startsWith('video/'));
                const nameEl = document.getElementById(fileNameId);
                if (nameEl) nameEl.textContent = file.name;
                saveBtn.disabled = false;
            }
        });
    }

    fileInput.addEventListener('change', () => {
        const file = fileInput.files[0];
        if (file) {
            mostrarPreviewWeb(tipo, URL.createObjectURL(file), file.type.startsWith('video/'));
            const nameEl = document.getElementById(fileNameId);
            if (nameEl) nameEl.textContent = file.name;
            saveBtn.disabled = false;
        }
    });

    saveBtn.addEventListener('click', async () => {
        const file = fileInput.files[0];
        if (!file) {
            showToast('Seleccioná una imagen primero', 'error');
            return;
        }

        const originalText = saveBtn.textContent;
        saveBtn.disabled = true;
        saveBtn.innerHTML = 'Subiendo... <span class="spinner"></span>';

        try {
            const result = await api.uploadImage(file);
            if (!result || !result.imageUrl) throw new Error('No se obtuvo URL de imagen');

            const campo = tipo === 'hero' ? { hero_url: result.imageUrl } : { banner_url: result.imageUrl };
            await api.saveConfigWeb(campo);

            mostrarPreviewWeb(tipo, result.imageUrl);
            fileInput.value = '';
            const nameEl = document.getElementById(fileNameId);
            if (nameEl) nameEl.textContent = 'Ningún archivo seleccionado';
            saveBtn.disabled = false;
            showToast(`Imagen de ${tipo === 'hero' ? 'Portada' : 'Banner'} guardada`);
        } catch (err) {
            console.error(err);
            showToast('Error al subir imagen: ' + err.message, 'error');
        } finally {
            saveBtn.disabled = false;
            saveBtn.textContent = originalText;
        }
    });
}