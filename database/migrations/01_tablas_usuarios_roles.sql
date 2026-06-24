-- ============================================================
-- 1. CREACIÓN DE ENUMS (Para control estricto en PostgreSQL)
-- ============================================================
CREATE TYPE tipo_rol AS ENUM ('admin', 'cashier', 'cooker', 'waiter');

-- ============================================================
-- 2. TABLA DE ROLES
-- ============================================================
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    nombre tipo_rol UNIQUE NOT NULL, -- 'admin', 'cashier', 'cooker', 'waiter'
    descripcion TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 3. TABLA DE USUARIOS
-- ============================================================
CREATE TABLE usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(), -- Compatible con Supabase Auth
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Contraseña encriptada para el backend en NestJS
    rol_id INT REFERENCES roles(id) ON DELETE RESTRICT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);