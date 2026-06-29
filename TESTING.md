# Guía de Testing - Restaurante Walpa Sua

Esta guía proporciona instrucciones completas para probar el backend y frontend del sistema de gestión del restaurante.

## 📋 Tabla de Contenidos

1. [Requisitos Previos](#requisitos-previos)
2. [Inicio Rápido](#inicio-rápido)
3. [Credenciales de Prueba](#credenciales-de-prueba)
4. [Testing del Backend](#testing-del-backend)
5. [Testing del Frontend](#testing-del-frontend)
6. [Endpoints Disponibles](#endpoints-disponibles)
7. [Troubleshooting](#troubleshooting)

## Requisitos Previos

- **Docker** y **Docker Compose** instalados
- **Node.js** v18+ (para desarrollo local sin Docker)
- **PostgreSQL** 15+ (para desarrollo local sin Docker)
- **Cliente HTTP** como Postman, Insomnia, o curl

## Inicio Rápido

### Opción 1: Con Docker (Recomendado)

```bash
# 1. Iniciar los servicios con Docker Compose
docker-compose up -d

# 2. Verificar que los contenedores estén corriendo
docker-compose ps

# 3. Ver logs del backend
docker-compose logs -f backend

# 4. Ver logs de la base de datos
docker-compose logs -f db
```

**URLs después de iniciar:**
- Backend API: http://localhost:3000/api
- PostgreSQL: localhost:5432
- Frontend: http://localhost:4200 (requiere `npm start` en /frontend)

### Opción 2: Sin Docker (Desarrollo Local)

```bash
# 1. Iniciar PostgreSQL
# Asegúrate de que PostgreSQL esté corriendo en el puerto 5432

# 2. Crear la base de datos e inicializarla
psql -U postgres
CREATE DATABASE walpa_db;
\c walpa_db
\i database/init.sql
\q

# 3. Instalar dependencias del backend
cd backend
npm install

# 4. Configurar variables de entorno
cp .env.development .env

# 5. Iniciar el backend
npm run start:dev

# 6. En otra terminal, iniciar el frontend
cd ../frontend
npm install
npm start
```

## Credenciales de Prueba

La base de datos viene con usuarios de prueba pre-configurados:

### Usuario Administrador
- **Email:** `admin@wallpasua.com`
- **Password:** `Admin123!`
- **Rol:** `admin`
- **Permisos:** Acceso completo a todos los módulos

### Usuario Cajero
- **Email:** `cajero@wallpasua.com`
- **Password:** `Cajero123!`
- **Rol:** `cashier`
- **Permisos:** Gestión de pedidos y pagos

### Usuario Cocinero
- **Email:** `cocinero@wallpasua.com`
- **Password:** `Cocinero123!`
- **Rol:** `cooker`
- **Permisos:** Visualización y actualización de pedidos

### Usuario Mozo
- **Email:** `mozo@wallpasua.com`
- **Password:** `Mozo123!`
- **Rol:** `waiter`
- **Permisos:** Creación y gestión de pedidos

## Testing del Backend

### 1. Verificar que el Backend esté Activo

```bash
curl http://localhost:3000/api
# Debería retornar: "Hello World!" o similar
```

### 2. Test de Autenticación

#### Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@wallpasua.com",
    "password": "Admin123!"
  }'
```

**Respuesta esperada:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "nombre": "Carlos",
    "apellido": "Mendoza",
    "email": "admin@wallpasua.com",
    "rol": "admin"
  }
}
```

**Guarda el `access_token` para usarlo en las siguientes peticiones.**

#### Obtener Perfil
```bash
# Reemplaza YOUR_TOKEN con el token obtenido del login
curl -X GET http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Test de Módulo de Usuarios

#### Listar Todos los Usuarios
```bash
curl -X GET http://localhost:3000/api/usuarios \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Obtener Roles Disponibles
```bash
curl -X GET http://localhost:3000/api/usuarios/roles \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Crear Nuevo Usuario
```bash
curl -X POST http://localhost:3000/api/usuarios \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan",
    "apellido": "Pérez",
    "email": "juan.perez@test.com",
    "password": "Test123!",
    "rolId": 4
  }'
```

#### Obtener Usuario por ID
```bash
# Reemplaza USER_ID con un UUID válido
curl -X GET http://localhost:3000/api/usuarios/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Actualizar Usuario
```bash
curl -X PUT http://localhost:3000/api/usuarios/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Juan Carlos",
    "activo": true
  }'
```

#### Eliminar Usuario
```bash
curl -X DELETE http://localhost:3000/api/usuarios/USER_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 4. Test de Módulo de Productos

#### Listar Todos los Productos
```bash
curl -X GET http://localhost:3000/api/productos \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Obtener Categorías
```bash
curl -X GET http://localhost:3000/api/productos/categorias \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Productos por Categoría
```bash
# Reemplaza CATEGORIA con: Entradas, Fondos, Bebidas, Postres
curl -X GET http://localhost:3000/api/productos/categoria/Fondos \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Crear Producto
```bash
curl -X POST http://localhost:3000/api/productos \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Ceviche Especial",
    "descripcion": "Ceviche de pescado fresco con camote y choclo",
    "precio": 35.00,
    "categoria": "Entradas",
    "disponible": true
  }'
```

#### Obtener Producto por ID
```bash
curl -X GET http://localhost:3000/api/productos/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Actualizar Producto
```bash
curl -X PUT http://localhost:3000/api/productos/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "precio": 38.00,
    "disponible": true
  }'
```

#### Eliminar Producto
```bash
curl -X DELETE http://localhost:3000/api/productos/1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 5. Test de Módulo de Pedidos

#### Listar Todos los Pedidos
```bash
curl -X GET http://localhost:3000/api/pedidos \
  -H "Authorization: Bearer YOUR_TOKEN"
```

#### Crear Pedido
```bash
curl -X POST http://localhost:3000/api/pedidos \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "mesaNumero": 5,
    "usuarioId": "a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11",
    "detalles": [
      {
        "itemId": 1,
        "cantidad": 2,
        "precioUnitario": 25.00
      },
      {
        "itemId": 2,
        "cantidad": 1,
        "precioUnitario": 45.00
      }
    ]
  }'
```

#### Actualizar Estado de Pedido
```bash
curl -X PUT http://localhost:3000/api/pedidos/1 \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "estado": "en_cocina"
  }'
```

### 6. Test de Módulo de Pagos

#### Registrar Pago
```bash
curl -X POST http://localhost:3000/api/pagos \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pedidoId": 1,
    "metodoPago": "efectivo",
    "monto": 95.00
  }'
```

#### Listar Pagos
```bash
curl -X GET http://localhost:3000/api/pagos \
  -H "Authorization: Bearer YOUR_TOKEN"
```

## Testing del Frontend

### 1. Acceso a la Aplicación

```bash
# Iniciar el servidor de desarrollo
cd frontend
npm start

# Abrir en el navegador
# http://localhost:4200
```

### 2. Test de Login

1. Navegar a `http://localhost:4200/login`
2. Ingresar credenciales:
   - Email: `admin@wallpasua.com`
   - Password: `Admin123!`
3. Verificar que se muestre el dashboard después del login
4. Verificar que el nombre del usuario aparezca en la interfaz

### 3. Test de Guards y Roles

#### Test de Autenticación
1. Sin estar logueado, intentar acceder a: `http://localhost:4200/dashboard`
2. Debería redirigir a `/login`

#### Test de Rol Admin
1. Login con usuario admin
2. Intentar acceder a rutas protegidas por `adminGuard`
3. Debería tener acceso completo

#### Test de Rol Cajero
1. Login con usuario cajero
2. Intentar acceder a rutas de admin
3. Debería redirigir a `/access-denied`
4. Acceso a módulos de cajero debería funcionar

### 4. Test de Signals

#### Verificar AuthService Signals
Abrir la consola del navegador y ejecutar:
```javascript
// Obtener instancia del AuthService desde un componente
// Verificar que los signals funcionan correctamente
console.log('Is Authenticated:', authService.isAuthenticated());
console.log('Current User:', authService.currentUser());
console.log('Current Role:', authService.currentRole());
console.log('Is Admin:', authService.isAdmin());
```

#### Verificar UsersStateService
```javascript
console.log('Usuarios:', usersState.usuarios());
console.log('Filtrados:', usersState.usuariosFiltrados());
console.log('Total:', usersState.totalUsuarios());
console.log('Activos:', usersState.usuariosActivos());
```

### 5. Test de Componentes de Ejemplo

Los siguientes componentes de ejemplo demuestran el uso de signals:

- `examples/login-example.component.ts` - Login con signals
- `examples/users-list-example.component.ts` - Lista de usuarios
- `examples/items-menu-example.component.ts` - Menú de productos

Para usarlos, importa y agrega al routing según necesites.

## Endpoints Disponibles

### Autenticación (`/api/auth`)
- `POST /login` - Iniciar sesión
- `GET /profile` - Obtener perfil del usuario autenticado

### Usuarios (`/api/usuarios`)
- `GET /` - Listar todos los usuarios
- `GET /roles` - Obtener roles disponibles
- `GET /:id` - Obtener usuario por ID (UUID)
- `POST /` - Crear nuevo usuario
- `PUT /:id` - Actualizar usuario
- `DELETE /:id` - Eliminar usuario

### Productos (`/api/productos`)
- `GET /` - Listar productos disponibles
- `GET /categorias` - Obtener categorías
- `GET /categoria/:nombre` - Productos por categoría
- `GET /:id` - Obtener producto por ID
- `POST /` - Crear producto
- `PUT /:id` - Actualizar producto
- `DELETE /:id` - Eliminar producto

### Pedidos (`/api/pedidos`)
- `GET /` - Listar pedidos
- `GET /:id` - Obtener pedido por ID
- `POST /` - Crear pedido
- `PUT /:id` - Actualizar pedido
- `DELETE /:id` - Eliminar pedido

### Pagos (`/api/pagos`)
- `GET /` - Listar pagos
- `GET /:id` - Obtener pago por ID
- `POST /` - Registrar pago

## Troubleshooting

### El backend no inicia

**Problema:** Error de conexión a la base de datos
```
Error: connect ECONNREFUSED 127.0.0.1:5432
```

**Solución:**
```bash
# Verificar que PostgreSQL esté corriendo
docker-compose ps db

# Reiniciar servicios
docker-compose restart db backend

# Ver logs
docker-compose logs db
```

### Error de autenticación JWT

**Problema:** `401 Unauthorized` en endpoints protegidos

**Solución:**
1. Verificar que el token esté en el header `Authorization: Bearer TOKEN`
2. El token puede haber expirado (24h), hacer login nuevamente
3. Verificar que la variable `JWT_SECRET` sea la misma en backend

### Frontend no conecta con Backend

**Problema:** CORS o conexión rechazada

**Solución:**
1. Verificar que `API_URL` en `environment.development.ts` sea `http://localhost:3000/api`
2. El backend NO tiene CORS habilitado, asegúrate de que frontend y backend estén en el mismo dominio
3. Si usas proxy, configúralo en `proxy.conf.json` (aunque no es necesario para este proyecto)

### Datos de prueba no aparecen

**Problema:** La base de datos está vacía

**Solución:**
```bash
# Eliminar volúmenes y recrear
docker-compose down -v
docker-compose up -d

# O manualmente ejecutar init.sql
docker-compose exec db psql -U root -d walpa_db -f /docker-entrypoint-initdb.d/init.sql
```

### Error de TypeORM

**Problema:** `Error: Entity metadata not found`

**Solución:**
1. Verificar que todas las entidades estén en `src/entities/`
2. Verificar que `database.module.ts` tenga la configuración correcta
3. Reiniciar el backend

### Signals no actualizan

**Problema:** Los computed signals no se actualizan en el frontend

**Solución:**
1. Asegurarse de llamar los signals como funciones: `signal()` no `signal`
2. Verificar que estés usando `set()` o `update()` para modificar signals
3. No mutar directamente el valor de un signal

## Scripts Útiles

### Resetear Base de Datos
```bash
# Con Docker
docker-compose down -v
docker-compose up -d

# Sin Docker
dropdb walpa_db
createdb walpa_db
psql -U postgres -d walpa_db -f database/init.sql
```

### Ver Logs en Tiempo Real
```bash
# Todos los servicios
docker-compose logs -f

# Solo backend
docker-compose logs -f backend

# Solo base de datos
docker-compose logs -f db
```

### Ejecutar Comandos en el Contenedor
```bash
# Acceder al contenedor del backend
docker-compose exec backend sh

# Acceder a PostgreSQL
docker-compose exec db psql -U root -d walpa_db
```

### Verificar Estado de la Base de Datos
```bash
# Conectar a PostgreSQL
docker-compose exec db psql -U root -d walpa_db

# Listar tablas
\dt

# Ver usuarios
SELECT id, nombre, email, rol_id FROM usuarios;

# Ver roles
SELECT * FROM roles;

# Ver items
SELECT * FROM items;

# Salir
\q
```

## Próximos Pasos

Una vez que hayas verificado que todo funciona correctamente:

1. **Desarrollo de Features**: Comienza a desarrollar nuevas funcionalidades
2. **Testing Automatizado**: Implementa tests unitarios y e2e
3. **CI/CD**: Configura pipeline de integración continua
4. **Documentación API**: Genera documentación con Swagger/OpenAPI
5. **Optimización**: Implementa caching, indexación de base de datos

## Recursos Adicionales

- [Documentación de NestJS](https://docs.nestjs.com/)
- [Documentación de TypeORM](https://typeorm.io/)
- [Documentación de Angular Signals](https://angular.dev/guide/signals)
- [Guía de Signals del Proyecto](frontend/SIGNALS-GUIDE.md)

---

¡Listo para comenzar el testing! 🚀
