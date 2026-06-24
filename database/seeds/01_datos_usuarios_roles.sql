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
-- ============================================================
-- Nota: Las contraseñas están simuladas en texto plano para el ejemplo, 
-- pero en producción NestJS guardará aquí el hash encriptado (ej: bcrypt).
INSERT INTO usuarios (id, nombre, apellido, email, password, rol_id) VALUES
('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'Carlos', 'Mendoza', 'admin@wallpasua.com', 'admin123', (SELECT id FROM roles WHERE nombre = 'admin')),
('b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 'Laura', 'Gómez', 'caja@wallpasua.com', 'caja123', (SELECT id FROM roles WHERE nombre = 'cashier')),
('c2eebc99-9c0b-4ef8-bb6d-6bb9bd380a33', 'Manuel', 'Castro', 'cocina@wallpasua.com', 'cocina123', (SELECT id FROM roles WHERE nombre = 'cooker')),
('d3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Juan', 'Quispe', 'mozo@wallpasua.com', 'mozo123', (SELECT id FROM roles WHERE nombre = 'waiter'))
ON CONFLICT (email) DO NOTHING;