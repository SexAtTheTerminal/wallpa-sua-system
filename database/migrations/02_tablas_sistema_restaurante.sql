-- ============================================================
-- 1. CREACIÓN DE ENUMS PARA EL RESTAURANTE
-- ============================================================
CREATE TYPE estado_pedido AS ENUM ('pendiente', 'en_cocina', 'listo', 'entregado', 'pagado');
CREATE TYPE metodo_pago_enum AS ENUM ('efectivo', 'tarjeta', 'yape', 'plin');
CREATE TYPE tipo_comprobante_enum AS ENUM ('boleta', 'factura');

-- ============================================================
-- 2. TABLA DE ITEMS / PRODUCTOS (Menú del restaurante)
-- ============================================================
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10,2) NOT NULL,
    categoria VARCHAR(50) NOT NULL, -- Ej. 'Entradas', 'Fondos', 'Bebidas'
    disponible BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 3. TABLA DE PEDIDOS
-- ============================================================
CREATE TABLE pedidos (
    id SERIAL PRIMARY KEY,
    usuario_id UUID REFERENCES usuarios(id) ON DELETE SET NULL, -- Mesero/Admin que toma el pedido
    nro_mesa VARCHAR(10) NOT NULL,
    estado estado_pedido DEFAULT 'pendiente',
    total DECIMAL(10,2) DEFAULT 0.00,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 4. DETALLE DEL PEDIDO (Relación de platos por cada pedido)
-- ============================================================
CREATE TABLE detalles_pedido (
    id SERIAL PRIMARY KEY,
    pedido_id INT REFERENCES pedidos(id) ON DELETE CASCADE,
    item_id INT REFERENCES items(id) ON DELETE RESTRICT,
    cantidad INT NOT NULL CHECK (cantidad > 0),
    precio_unitario DECIMAL(10,2) NOT NULL, -- Guarda el precio del momento de la compra
    notas TEXT -- Ej. "Sin cebolla", "Bien frito"
);

-- ============================================================
-- 5. TABLA DE PAGOS (Control de caja)
-- ============================================================
CREATE TABLE pagos (
    id SERIAL PRIMARY KEY,
    pedido_id INT REFERENCES pedidos(id) ON DELETE RESTRICT,
    cajero_id UUID REFERENCES usuarios(id) ON DELETE SET NULL, -- Cajero que cobra
    monto_pagado DECIMAL(10,2) NOT NULL,
    metodo_pago metodo_pago_enum NOT NULL,
    fecha_pago TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================================
-- 6. TABLA DE COMPROBANTES (Integración con API Perú / SUNAT)
-- ============================================================
CREATE TABLE comprobantes (
    id SERIAL PRIMARY KEY,
    pago_id INT REFERENCES pagos(id) ON DELETE RESTRICT,
    tipo_comprobante tipo_comprobante_enum NOT NULL,
    serie VARCHAR(4) NOT NULL, -- Ej: 'F001' para Factura, 'B001' para Boleta
    numero INT NOT NULL,      -- Correlativo autoincremental
    cliente_documento VARCHAR(11) NOT NULL, -- DNI (8) o RUC (11)
    cliente_nombre VARCHAR(255) NOT NULL,   -- Nombre o Razón Social
    monto_subtotal DECIMAL(10,2) NOT NULL,
    monto_igv DECIMAL(10,2) NOT NULL,
    monto_total DECIMAL(10,2) NOT NULL,
    fecha_emision TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);