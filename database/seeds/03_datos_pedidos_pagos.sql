-- ============================================================
-- INITIAL SEEDS: HISTORIAL DE PEDIDOS, PAGOS Y COMPROBANTES
-- ============================================================

-- 1. Insertar un pedido simulado para la Mesa 5 (Monto Total temporal: 42.00)
INSERT INTO pedidos (id, usuario_id, nro_mesa, estado, total) VALUES
(1001, 'd3eebc99-9c0b-4ef8-bb6d-6bb9bd380a44', 'Mesa 5', 'pagado', 42.00);

-- 2. Insertar los detalles del pedido 1001 (1 Lomo Saltado y 1 Chicha Morada)
INSERT INTO detalles_pedido (pedido_id, item_id, cantidad, precio_unitario, notas) VALUES
(1001, (SELECT id FROM items WHERE nombre = 'Lomo Saltado'), 1, 32.00, 'Bien jugoso, papas crocantes'),
(1001, (SELECT id FROM items WHERE nombre = 'Chicha Morada 1L'), 1, 10.00, 'Con poco hielo');

-- 3. Registrar el pago del pedido en caja (Atendido por la cajera Laura)
INSERT INTO pagos (id, pedido_id, cajero_id, monto_pagado, metodo_pago) VALUES
(5001, 1001, 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a22', 42.00, 'yape');

-- 4. Generar el comprobante electrónico (Boleta de Venta asociada al pago)
INSERT INTO comprobantes (pago_id, tipo_comprobante, serie, numero, cliente_documento, cliente_nombre, monto_subtotal, monto_igv, monto_total) VALUES
(5001, 'boleta', 'B001', 142, '77665544', 'Martin Alonso Quiñones', 35.59, 6.41, 42.00);