# API REST de Usuarios — Node.js + Express + PostgreSQL

API REST para registrar, consultar, actualizar y eliminar usuarios (CRUD), desarrollada con **Node.js** y **Express** y conectada a una base de datos relacional **PostgreSQL**. Los endpoints se prueban con **Postman**.


> Guía Práctica N.º 3 — Desarrollo Web · Unidad 3: Lenguaje del lado del servidor (Back-End) · UNEMI

## Tecnologías utilizadas

| Tecnología | Uso |
|---|---|
| Node.js (v18 o superior) | Entorno de ejecución de JavaScript en el servidor |
| Express 5 | Framework para crear la API REST (rutas, middlewares) |
| PostgreSQL | Base de datos relacional |
| pg (node-postgres) | Conexión entre Node.js y PostgreSQL |
| bcryptjs | Cifrado de contraseñas antes de guardarlas |
| dotenv | Variables de entorno (datos de conexión) |
| cors | Permite consumir la API desde un front-end |
| nodemon | Reinicio automático en desarrollo |
| Postman | Pruebas de los endpoints |

## Funcionalidades implementadas

- **CRUD completo** de usuarios: registrar, consultar todos, consultar por ID, actualizar y eliminar.
- **Validación de datos** antes de guardar:
  - `nombre`: obligatorio, solo letras y espacios (3 a 100 caracteres).
  - `correo`: formato válido y **único** (no se repite).
  - `contrasena`: mínimo 8 caracteres, con letras y números. Se guarda **cifrada** con bcrypt y **nunca** se devuelve en las respuestas.
  - `edad`: número entero entre 1 y 120.
  - `telefono`: 10 dígitos, empieza con 09 (ejemplo: `0991234567`).
- **Respuestas HTTP adecuadas** para cada caso (201, 200, 400, 404, 409, 503, 500).
- **Manejo centralizado de errores**: JSON mal escrito, correo duplicado, id inválido, ruta inexistente y base de datos caída.
- **Actualización parcial**: en `PUT` se puede enviar uno o varios campos.
- Script para **crear la base de datos y la tabla** automáticamente (`npm run db:init`).
- **Colección de Postman** con pruebas automáticas.

## Estructura del proyecto

```
api-usuarios/
├── database/
│   ├── 01_crear_base_datos.sql      # CREATE DATABASE
│   └── 02_crear_tabla_usuarios.sql  # CREATE TABLE usuarios
├── postman/
│   └── API-Usuarios.postman_collection.json
├── scripts/
│   └── init-db.js                   # Crea la BD y la tabla
├── src/
│   ├── config/db.js                 # Conexión a PostgreSQL (Pool)
│   ├── controllers/usuarios.controller.js  # Lógica CRUD
│   ├── middlewares/
│   │   ├── validarUsuario.js        # Validaciones
│   │   └── manejoErrores.js         # 404 y errores
│   ├── routes/usuarios.routes.js    # Rutas /usuarios
│   ├── app.js                       # Configuración de Express
│   └── index.js                     # Inicio del servidor
├── .env.example
├── package.json
└── README.md
```

## Diseño de la base de datos

```sql
CREATE TABLE usuarios (
    id                  SERIAL       PRIMARY KEY,
    nombre              VARCHAR(100) NOT NULL,
    correo              VARCHAR(120) NOT NULL UNIQUE,
    contrasena          VARCHAR(255) NOT NULL,
    edad                INTEGER      NOT NULL CHECK (edad BETWEEN 1 AND 120),
    telefono            VARCHAR(10)  NOT NULL CHECK (telefono ~ '^09[0-9]{8}$'),
    fecha_registro      TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP
);
```

## Instalación y ejecución

**Requisitos:** Node.js 18 o superior y PostgreSQL instalado y en ejecución.

1. Clonar el repositorio e instalar dependencias:
   ```bash
   git clone <url-del-repositorio>
   cd api-usuarios
   npm install
   ```
2. Crear el archivo `.env` a partir del ejemplo y colocar la contraseña de PostgreSQL:
   ```bash
   cp .env.example .env
   ```
   ```env
   PORT=3000
   DB_HOST=localhost
   DB_PORT=5432
   DB_USER=postgres
   DB_PASSWORD=tu_contrasena
   DB_NAME=api_usuarios
   ```
3. Crear la base de datos y la tabla (elegir una opción):
   - Automático: `npm run db:init`
   - Manual (pgAdmin o psql): ejecutar `database/01_crear_base_datos.sql` y luego, dentro de la base `api_usuarios`, `database/02_crear_tabla_usuarios.sql`.
4. Iniciar el servidor:
   ```bash
   npm run dev     # desarrollo (nodemon)
   npm start       # normal
   ```
   Debe aparecer:
   ```
   Servidor ejecutándose en http://localhost:3000
   Conectado a PostgreSQL - base de datos: api_usuarios
   ```

## Endpoints

URL base: `http://localhost:3000`

| Método | Ruta | Descripción | Respuesta exitosa |
|---|---|---|---|
| POST | `/usuarios` | Registrar un usuario | 201 Created |
| GET | `/usuarios` | Consultar todos los usuarios | 200 OK |
| GET | `/usuarios/:id` | Consultar un usuario por ID | 200 OK |
| PUT | `/usuarios/:id` | Actualizar un usuario (uno o varios campos) | 200 OK |
| DELETE | `/usuarios/:id` | Eliminar un usuario | 200 OK |

### Ejemplo: registrar un usuario

`POST /usuarios` con body JSON:
```json
{
  "nombre": "Ana Torres",
  "correo": "ana.torres@correo.com",
  "contrasena": "Segura2026",
  "edad": 21,
  "telefono": "0991234567"
}
```
Respuesta `201 Created`:
```json
{
  "ok": true,
  "mensaje": "Usuario registrado correctamente.",
  "data": {
    "id": 1,
    "nombre": "Ana Torres",
    "correo": "ana.torres@correo.com",
    "edad": 21,
    "telefono": "0991234567",
    "fecha_registro": "2026-11-10T21:53:31.054Z",
    "fecha_actualizacion": null
  }
}
```

### Ejemplo: error de validación

Respuesta `400 Bad Request`:
```json
{
  "ok": false,
  "mensaje": "Datos inválidos.",
  "errores": [
    { "campo": "correo", "mensaje": "El correo no tiene un formato válido (ejemplo: usuario@correo.com)." },
    { "campo": "edad", "mensaje": "La edad debe ser un número entero entre 1 y 120." }
  ]
}
```

### Códigos HTTP utilizados

| Código | Cuándo se devuelve |
|---|---|
| 200 OK | Consulta, actualización o eliminación correcta |
| 201 Created | Usuario registrado |
| 400 Bad Request | Datos inválidos, campos faltantes, JSON mal escrito o id no numérico |
| 404 Not Found | El usuario o la ruta no existe |
| 409 Conflict | El correo ya está registrado |
| 503 Service Unavailable | No hay conexión con PostgreSQL |
| 500 Internal Server Error | Error inesperado del servidor |

## Pruebas con Postman

1. Abrir Postman → **Import** → seleccionar `postman/API-Usuarios.postman_collection.json`.
2. Con el servidor encendido, ejecutar las peticiones en orden (o **Run collection**).
3. La colección incluye 10 peticiones con pruebas automáticas: registro, datos inválidos (400), correo duplicado (409), consulta general, consulta por ID, ID inexistente (404), actualización, eliminación y verificación de la eliminación.

La petición de registro guarda el `id` creado en la variable `{{id}}`, que usan las siguientes peticiones.