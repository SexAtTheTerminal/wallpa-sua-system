# Guía de Configuración de Usuarios y Empleados

Este archivo contiene los queries de PostgreSQL necesarios para inicializar los valores maestros y realizar inserciones de prueba.

## 1. Inicialización de Tablas Maestras (Cargos y Roles)

Es necesario contar con estos registros para poder asociarlos a los empleados y usuarios.

```sql
-- Insertar Cargos
INSERT INTO "Cargo" ("nombreCargo") 
VALUES 
('Administrador'),
('Cajero'),
('Cocinero');

-- Insertar Roles
INSERT INTO "Rol" ("nombreRol") 
VALUES 
('Administrador'),
('Cajero'),
('Cocinero');
```

## 2. Ejemplo de Creación de Empleado y Usuario

Para insertar un usuario manualmente, primero debes tener el `idAuth` que genera Supabase (UUID). 

### Paso A: Insertar el Empleado
Primero creamos al empleado y obtenemos su `idEmpleado`. Suponiendo que el Cargo "Administrador" tiene el `idCargo = 1`.

```sql
INSERT INTO "Empleado" (
    "nombreEmpleado", 
    "apellPaternEmpleado", 
    "apellMaternEmpleado", 
    "DNI", 
    "telefono", 
    "fechaNacimiento", 
    "idCargo"
) 
VALUES (
    'Juan', 
    'Perez', 
    'Gomez', 
    '12345678', 
    '987654321', 
    '1990-05-15', 
    1 -- ID del Cargo (Administrador)
)
RETURNING "idEmpleado";
```

### Paso B: Insertar el Usuario
Una vez que tienes el `idEmpleado` (ej. 1) y el UUID de Supabase Auth (ej. '550e8400-e29b-41d4-a716-446655440000'), insertas en la tabla `Usuario`. Suponiendo que el Rol "Administrador" tiene el `idRol = 1`.

```sql
INSERT INTO "Usuario" (
    "email", 
    "idRol", 
    "idEmpleado", 
    "idAuth", 
    "estado", 
    "fechaCreacion"
) 
VALUES (
    'admin@sistema.com', 
    1, -- ID del Rol (Administrador)
    1, -- ID del Empleado obtenido en el paso anterior
    '550e8400-e29b-41d4-a716-446655440000', -- UUID de Supabase Auth
    true, 
    NOW()
);
```

## 3. Query Avanzado (Basado en `crearUsuarioCompleto`)

Este bloque de PL/pgSQL ejecuta la inserción vinculada en un solo paso, replicando el comportamiento del `UsersServiceService`.

```sql
-- Ejecutar en el Editor SQL de Supabase
DO $$
DECLARE
    v_auth_id UUID := 'AQUÍ_EL_UUID_DE_SUPABASE'; -- Obtener de Auth > Users
    v_empleado_id INTEGER;
BEGIN
    -- 1. Insertar Empleado
    INSERT INTO "Empleado" (
        "nombreEmpleado", 
        "apellPaternEmpleado", 
        "apellMaternEmpleado", 
        "DNI", 
        "telefono", 
        "fechaNacimiento", 
        "idCargo"
    ) 
    VALUES (
        'Nombre',           -- usuarioData.nombre
        'ApellidoPaterno',  -- usuarioData.apellidoPaterno
        'ApellidoMaterno',  -- usuarioData.apellidoMaterno
        '12345678',         -- usuarioData.dni
        '987654321',        -- usuarioData.telefono
        '1995-01-01',       -- usuarioData.fechaNacimiento
        1                   -- idCargo (1: Admin, 2: Cajero, 3: Cocinero)
    )
    RETURNING "idEmpleado" INTO v_empleado_id;

    -- 2. Insertar Usuario
    INSERT INTO "Usuario" (
        "email", 
        "idRol", 
        "idEmpleado", 
        "idAuth", 
        "estado", 
        "fechaCreacion"
    ) 
    VALUES (
        'correo@ejemplo.com', 
        1,                  -- idRol (1: Admin, 2: Cajero, 3: Cocinero)
        v_empleado_id, 
        v_auth_id, 
        true, 
        NOW()
    );

    RAISE NOTICE 'Proceso completado. Empleado ID: %', v_empleado_id;
END $$;
```

---

### Notas Importantes
* **idAuth**: Este campo es la clave foránea que conecta tu tabla `Usuario` con la tabla interna de Supabase `auth.users`. Si haces la inserción manual, asegúrate de que el UUID exista en el Dashboard de Supabase -> Authentication.
* **PKs**: Si tus tablas usan `SERIAL` o `IDENTITY` para los IDs, no es necesario incluirlos en el `INSERT`.
