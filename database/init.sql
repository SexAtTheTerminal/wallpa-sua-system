-- ============================================================
-- SCRIPT DE INICIALIZACIÓN DE BASE DE DATOS - WALPA SUA
-- Este script crea todas las tablas y datos iniciales
-- ============================================================

-- ============================================================
-- 1. CREACIÓN DE ENUMS (Para control estricto en PostgreSQL)
-- ============================================================
DO $$ BEGIN
    CREATE TYPE tipo_rol AS ENUM ('admin', 'cashier', 'cooker', 'waiter');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE estado_pedido AS ENUM ('pendiente', 'en_cocina', 'listo', 'entregado', 'pagado');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE metodo_pago_enum AS ENUM ('efectivo', 'tarjeta', 'yape', 'plin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE tipo_comprobante_enum AS ENUM ('boleta', 'factura');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- ============================================================
-- 2. TABLA DE ROLES
-- ============================================================
CREATE TABLE IF NOT EXISTS roles (
    id SERIAL PRIMARY KEY,
    nombre tipo_rol UNIQUE NOT NULL,
    descripcion TEXT,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 3. TABLA DE USUARIOS
-- ============================================================
CREATE TABLE IF NOT EXISTS usuarios (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    rol_id INT REFERENCES roles(id) ON DELETE RESTRICT,
    activo BOOLEAN DEFAULT TRUE,
    fecha_registro TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 4. TABLA DE ITEMS / PRODUCTOS (Menú del restaurante)
-- ============================================================
CREATE TABLE IF NOT EXISTS items (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(50) NOT NULL,
    disponible BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 5. TABLA DE PEDIDOS
-- ============================================================
CREATE TABLE IF NOT EXISTS pedidos (
    id SERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    nro_mesa VARCHAR(10) NOT NULL,
    estado estado_pedido DEFAULT 'pendiente',
    total DECIMAL(10,2) DEFAULT 0.00,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 6. DETALLE DEL PEDIDO (Relación de platos por cada pedido)
-- ============================================================
CREATE TABLE IF NOT EXISTS detalles_pedido (
    id SERIAL PRIMARY KEY,
    pedido_id INT REFERENCES pedidos(id) ON DELETE CASCADE,
    item_id INT REFERENCES items(id) ON DELETE RESTRICT,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL,
    notas TEXT
);

-- ============================================================
-- 7. TABLA DE PAGOS (Control de caja)
-- ============================================================
CREATE TABLE IF NOT EXISTS pagos (
    id SERIAL PRIMARY KEY,
    pedido_id INT REFERENCES pedidos(id) ON DELETE RESTRICT,
    cajero_id UUID REFERENCES usuarios(id) ON DELETE SET NULL,
    monto_pagado DECIMAL(10,2) NOT NULL,
    metodo_pago metodo_pago_enum NOT NULL,
    fecha_pago TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 8. TABLA DE COMPROBANTES (Integración con API Perú / SUNAT)
-- ============================================================
CREATE TABLE IF NOT EXISTS comprobantes (
    id SERIAL PRIMARY KEY,
    pago_id INT REFERENCES pagos(id) ON DELETE RESTRICT,
    tipo_comprobante tipo_comprobante_enum NOT NULL,
    serie VARCHAR(4) NOT NULL,
    numero INT NOT NULL,
    cliente_documento VARCHAR(11) NOT NULL,
    cliente_nombre VARCHAR(255) NOT NULL,
    monto_subtotal DECIMAL(10,2) NOT NULL,
    monto_igv DECIMAL(10,2) NOT NULL,
    monto_total DECIMAL(10,2) NOT NULL,
    fecha_emision TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- INITIAL SEEDS: ROLES
-- ============================================================
INSERT INTO roles (nombre, descripcion) VALUES
('admin', 'Administrador general con acceso total al sistema de gestión'),
('cashier', 'Personal de caja encargado de cobros y emisión de comprobantes'),
('cooker', 'Personal de cocina encargado de la preparación de pedidos'),
('waiter', 'Personal de salón encargado de tomar pedidos en las mesas')
ON CONFLICT (nombre) DO NOTHING;

-- ============================================================
-- INITIAL SEEDS: USUARIOS DE PRUEBA
-- NOTA: Las contraseñas deben ser hasheadas por bcrypt en el backend
-- Estos passwords están en texto plano solo para demostración
-- ============================================================
INSERT INTO usuarios (id, nombre, apellido, email, password, rol_id) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Carlos', 'Mendoza', 'admin@wallpasua.com', '$2a$10$8Yb73rcm/6RtPeQCWY3JTeTbhoOzW9XEeG6CTxu/9Ac7uSDSruVI6', (SELECT id FROM roles WHERE nombre = 'admin')),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Laura', 'Gómez', 'caja@wallpasua.com', '$2a$10$8Yb73rcm/6RtPeQCWY3JTeTbhoOzW9XEeG6CTxu/9Ac7uSDSruVI6', (SELECT id FROM roles WHERE nombre = 'cashier')),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Manuel', 'Castro', 'cocina@wallpasua.com', '$2a$10$8Yb73rcm/6RtPeQCWY3JTeTbhoOzW9XEeG6CTxu/9Ac7uSDSruVI6', (SELECT id FROM roles WHERE nombre = 'cooker')),
('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Juan', 'Quispe', 'mozo@wallpasua.com', '$2a$10$8Yb73rcm/6RtPeQCWY3JTeTbhoOzW9XEeG6CTxu/9Ac7uSDSruVI6', (SELECT id FROM roles WHERE nombre = 'waiter'))
ON CONFLICT (email) DO NOTHING;

-- ============================================================
-- INITIAL SEEDS: ITEMS / MENÚ DEL RESTAURANTE
-- ============================================================
INSERT INTO items (nombre, descripcion, precio, categoria, disponible) VALUES
('Ceviche Carretillero', 'Ceviche de pescado fresco acompañado de chicharrón de pota, camote y choclo', 28.50, 'Entradas', true),
('Papa a la Huancaína', 'Rodajas de papa sancochada bañadas en crema de ají amarillo y queso fresco', 12.00, 'Entradas', true),
('Lomo Saltado', 'Jugosos trozos de lomo de res saltados al wok con cebolla, tomate y papas fritas', 32.00, 'Fondos', true),
('Arroz con Mariscos', 'Arroz sazonado con aderezo norteño, mixtura de mariscos frescos y sarza criolla', 30.00, 'Fondos', true),
('Chicha Morada 1L', 'Bebida natural de maíz morado hervido con piña, manzana y canela', 10.00, 'Bebidas', true),
('Maracuyá Personal', 'Jugo natural de maracuyá helado', 4.50, 'Bebidas', true)
ON CONFLICT DO NOTHING;
