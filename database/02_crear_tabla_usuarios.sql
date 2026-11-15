-- Paso 2: crear la tabla (ejecutar conectado a la BD "api_usuarios")
-- Los campos son los mismos del formulario de registro de las prácticas anteriores:
-- nombre, correo, contraseña, edad y teléfono.

CREATE TABLE IF NOT EXISTS usuarios (
    id              SERIAL       PRIMARY KEY,
    nombre          VARCHAR(100) NOT NULL,
    correo          VARCHAR(120) NOT NULL UNIQUE,
    contrasena      VARCHAR(255) NOT NULL,              -- se guarda cifrada (bcrypt)
    edad            INTEGER      NOT NULL CHECK (edad BETWEEN 1 AND 120),
    telefono        VARCHAR(10)  NOT NULL CHECK (telefono ~ '^09[0-9]{8}$'),
    fecha_registro  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP
);
