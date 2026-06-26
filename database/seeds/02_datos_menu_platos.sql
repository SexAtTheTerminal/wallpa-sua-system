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