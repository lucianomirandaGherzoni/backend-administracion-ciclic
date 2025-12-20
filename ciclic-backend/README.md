# Ciclic Backend - API REST

Backend de la aplicación Ciclic para gestionar eventos y galería de imágenes. API RESTful construida con Node.js y Express que se conecta a Supabase como base de datos y almacenamiento.

## Tecnologías

- **Node.js** v22.x - Runtime de JavaScript
- **Express** v5.2.1 - Framework web minimalista
- **Supabase** - Base de datos PostgreSQL + Storage
  - `@supabase/supabase-js` v2.89.0 - Cliente de Supabase
- **Multer** v2.0.2 - Manejo de archivos multipart/form-data
- **dotenv** v17.2.3 - Variables de entorno
- **cors** v2.8.5 - Configuración de CORS
- **Nodemon** v3.1.11 - Hot reload en desarrollo

## Estructura del Proyecto

```
ciclic-backend/
├── modulos/
│   ├── controlador.mjs      # Lógica de controladores
│   ├── modelo.mjs            # Acceso a datos (Supabase)
│   ├── rutas.mjs             # Definición de endpoints
│   └── supabaseClient.mjs    # Cliente de Supabase configurado
├── .env                      # Variables de entorno (NO subir a Git)
├── .gitignore                # Archivos ignorados por Git
├── index.mjs                 # Punto de entrada de la aplicación
├── package.json              # Dependencias y scripts
├── vercerl.json              # Configuración de Vercel
└── README.md                 # Documentación
```

## Configuración Inicial

### 1. Clonar o descargar el proyecto

```bash
cd ciclic-backend
```

### 2. Instalar dependencias

```bash
npm install
```

### 3. Configurar variables de entorno

Crea un archivo `.env` en la raíz del proyecto con el siguiente contenido:

```env
# Puerto del servidor
PORT=3000

# Credenciales de Supabase
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui

# Nombre del bucket de imágenes en Supabase Storage
SUPABASE_BUCKET_NAME=imagenes-eventos
```

**Importante:** 
- Obtén `SUPABASE_URL` y `SUPABASE_SERVICE_ROLE_KEY` desde tu proyecto de Supabase (Project Settings → API)
- Usa la clave **service_role** (no la anon key) para permisos de administrador
- Crea el bucket `imagenes-eventos` en Supabase Storage

### 4. Configurar Supabase

En tu proyecto de Supabase, crea las siguientes tablas:

**Tabla: `galeria_eventos`**
```sql
CREATE TABLE galeria_eventos (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  imagen TEXT NOT NULL,
  fecha TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW()
);
```

**Tabla: `proximos_eventos`**
```sql
CREATE TABLE proximos_eventos (
  id SERIAL PRIMARY KEY,
  titulo VARCHAR(255) NOT NULL,
  descripcion TEXT,
  ubicacion VARCHAR(255),
  fecha DATE,
  hora TIME,
  precio DECIMAL(10, 2),
  capacidad INTEGER,
  categoria VARCHAR(100),
  imagen TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Cómo Ejecutar

### Modo Desarrollo (con hot reload)

```bash
npm run dev
```

### Modo Producción

```bash
npm start
```

El servidor estará disponible en `http://localhost:3000`

## Endpoints de la API

### Base URL
```
http://localhost:3000/api/v1
```

---

### **Galería de Eventos**

#### 1. Obtener todos los items de la galería
```http
GET /api/v1/galeria
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "titulo": "Festival de Música 2025",
    "descripcion": "Un evento increíble",
    "imagen": "https://...",
    "fecha": "2025-12-20T10:00:00Z"
  }
]
```

#### 2. Obtener un item por ID
```http
GET /api/v1/galeria/:id
```

#### 3. Crear nuevo item en galería
```http
POST /api/v1/galeria
Content-Type: application/json
```

**Body:**
```json
{
  "titulo": "Festival de Música 2025",
  "descripcion": "Gran festival al aire libre",
  "imagen": "https://wxtjlgpzjntrditlgqtz.supabase.co/storage/v1/object/public/imagenes-eventos/..."
}
```

#### 4. Actualizar item de galería
```http
PUT /api/v1/galeria/:id
Content-Type: application/json
```

**Body:**
```json
{
  "titulo": "Festival de Jazz 2025",
  "descripcion": "Descripción actualizada"
}
```

#### 5. Eliminar item de galería
```http
DELETE /api/v1/galeria/:id
```

---

### **Próximos Eventos**

#### 1. Obtener todos los eventos
```http
GET /api/v1/eventos
```

**Respuesta:**
```json
[
  {
    "id": 1,
    "titulo": "Concierto de Rock",
    "descripcion": "Gran concierto",
    "ubicacion": "Estadio Nacional",
    "fecha": "2025-12-25",
    "hora": "20:00:00",
    "precio": 5000,
    "capacidad": 500,
    "categoria": "Música",
    "imagen": "https://..."
  }
]
```

#### 2. Obtener evento por ID
```http
GET /api/v1/eventos/:id
```

#### 3. Crear nuevo evento
```http
POST /api/v1/eventos
Content-Type: application/json
```

**Body:**
```json
{
  "titulo": "Concierto de Rock",
  "descripcion": "Gran concierto al aire libre",
  "ubicacion": "Estadio Nacional",
  "fecha": "2025-12-25",
  "hora": "20:00:00",
  "precio": 5000,
  "capacidad": 500,
  "categoria": "Música",
  "imagen": "https://..."
}
```

#### 4. Actualizar evento
```http
PUT /api/v1/eventos/:id
Content-Type: application/json
```

**Body:**
```json
{
  "titulo": "Concierto de Jazz",
  "precio": 6000
}
```

#### 5. Eliminar evento
```http
DELETE /api/v1/eventos/:id
```

---

### **Gestión de Imágenes**

#### 1. Subir imagen
```http
POST /api/v1/upload-image
Content-Type: multipart/form-data
```

**Form Data:**
- `image` (archivo): Imagen a subir

**Respuesta:**
```json
{
  "mensaje": "Imagen subida correctamente",
  "url": "https://wxtjlgpzjntrditlgqtz.supabase.co/storage/v1/object/public/imagenes-eventos/1734567890123-foto.jpg"
}
```

#### 2. Eliminar imagen
```http
DELETE /api/v1/delete-image
Content-Type: application/json
```

**Body:**
```json
{
  "imageUrl": "https://wxtjlgpzjntrditlgqtz.supabase.co/storage/v1/object/public/imagenes-eventos/imagen.jpg"
}
```

---

## Probar con Thunder Client

1. Instala Thunder Client en VS Code
2. Asegúrate de que el servidor esté corriendo (`npm run dev`)
3. Crea una nueva request con:
   - **Method:** GET/POST/PUT/DELETE
   - **URL:** `http://localhost:3000/api/v1/eventos`
   - **Body:** JSON según el endpoint

---

## Deploy en Vercel

### 1. Instalar Vercel CLI (opcional)

```bash
npm i -g vercel
```

### 2. Configurar variables de entorno en Vercel

Ve a tu proyecto en Vercel → Settings → Environment Variables y agrega:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_BUCKET_NAME`

### 3. Desplegar

```bash
vercel --prod
```

---

## Cómo se Creó este Proyecto

1. **Inicialización del proyecto:**
   ```bash
   npm init -y
   ```

2. **Instalación de dependencias:**
   ```bash
   npm install express @supabase/supabase-js cors dotenv multer body-parser
   npm install -D nodemon
   ```

3. **Configuración de módulos ES6** (`package.json`):
   ```json
   {
     "type": "module"
   }
   ```

4. **Estructura modular:**
   - `supabaseClient.mjs` - Configuración del cliente de Supabase
   - `modelo.mjs` - Funciones de acceso a datos
   - `controlador.mjs` - Lógica de negocio
   - `rutas.mjs` - Definición de endpoints
   - `index.mjs` - Servidor Express

5. **Configuración de CORS y middlewares** para permitir peticiones desde el frontend

6. **Integración con Supabase** para base de datos y almacenamiento de imágenes

---

## Notas Importantes

- Las imágenes se almacenan en Supabase Storage
- Al eliminar un evento/galería, la imagen asociada también se elimina automáticamente
- Usa la clave `service_role` de Supabase para permisos de administrador
- Nunca subas el archivo `.env` a Git (ya está en `.gitignore`)

---

## Solución de Problemas

### Error: "Invalid supabaseUrl"
- Verifica que `SUPABASE_URL` en `.env` sea una URL válida que comience con `https://`

### Error: "Cannot find module"
- Ejecuta `npm install` para instalar todas las dependencias

### El servidor no inicia
- Verifica que el puerto 3000 no esté ocupado
- Revisa que todas las variables de entorno estén configuradas correctamente

---

## Autor

Proyecto Ciclic Backend - 2025
