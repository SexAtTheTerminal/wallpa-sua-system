# Guía de Uso de Signals en el Frontend

Esta guía explica cómo usar los signals de Angular en el proyecto actualizado.

## 📚 Tabla de Contenidos

1. [¿Qué son los Signals?](#qué-son-los-signals)
2. [AuthService con Signals](#authservice-con-signals)
3. [Servicios de Estado](#servicios-de-estado)
4. [Guards con Signals](#guards-con-signals)
5. [Ejemplos de Componentes](#ejemplos-de-componentes)
6. [Mejores Prácticas](#mejores-prácticas)

## ¿Qué son los Signals?

Los **Signals** son una primitiva reactiva de Angular que permite crear estado reactivo de forma eficiente. Son una alternativa moderna a RxJS Observables para manejo de estado.

### Ventajas de Signals

- ✅ **Rendimiento**: Actualizaciones granulares y eficientes
- ✅ **Simplicidad**: Sintaxis más sencilla que Observables
- ✅ **Type-safe**: Totalmente tipado con TypeScript
- ✅ **Computed**: Derivar estado automáticamente
- ✅ **Effects**: Reaccionar a cambios de estado

## AuthService con Signals

El `AuthService` ahora usa signals para manejar el estado de autenticación:

### Signals Disponibles

```typescript
import { inject } from '@angular/core';
import { AuthService } from './auth/data-access/auth.service';

export class MyComponent {
  authService = inject(AuthService);

  ngOnInit() {
    // Leer signals (son funciones)
    const user = this.authService.currentUser();
    const role = this.authService.currentRole();

    // Computed signals
    const isAuth = this.authService.isAuthenticated();
    const name = this.authService.userName();
    const isAdmin = this.authService.isAdmin();
    const isCashier = this.authService.isCashier();
    const isCooker = this.authService.isCooker();
    const isWaiter = this.authService.isWaiter();
  }
}
```

### Uso en Templates

```html
<!-- Acceder a signals en el template -->
<div>
  @if (authService.isAuthenticated()) {
    <p>Bienvenido, {{ authService.userName() }}</p>
    <p>Rol: {{ authService.currentRole() }}</p>

    @if (authService.isAdmin()) {
      <button>Panel de Administración</button>
    }

    @if (authService.isCashier()) {
      <button>Módulo de Caja</button>
    }
  } @else {
    <a routerLink="/login">Iniciar Sesión</a>
  }
</div>
```

### Login con Signals

```typescript
import { Component, inject, signal } from '@angular/core';
import { AuthService } from './auth/data-access/auth.service';

@Component({...})
export class LoginComponent {
  authService = inject(AuthService);
  router = inject(Router);

  // Signals locales
  email = signal('');
  password = signal('');
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  onLogin() {
    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.logIn({
      email: this.email(),
      password: this.password()
    }).subscribe({
      next: () => {
        this.loading.set(false);
        this.router.navigate(['/dashboard']);
      },
      error: (err) => {
        this.loading.set(false);
        this.errorMessage.set(err.message);
      }
    });
  }

  onLogout() {
    this.authService.signOut();
  }
}
```

## Servicios de Estado

### UsersStateService

Maneja el estado de usuarios con signals:

```typescript
import { inject } from '@angular/core';
import { UsersStateService } from './services/data-access/users-service/users-state.service';

export class UsersComponent {
  usersState = inject(UsersStateService);

  ngOnInit() {
    // Leer estado
    const usuarios = this.usersState.usuarios();
    const loading = this.usersState.loading();
    const error = this.usersState.error();

    // Computed signals
    const filtrados = this.usersState.usuariosFiltrados();
    const total = this.usersState.totalUsuarios();
    const activos = this.usersState.usuariosActivos();
    const porRol = this.usersState.usuariosPorRol();

    // Métodos para actualizar estado
    this.usersState.setSearchTerm('Juan');
    this.usersState.setRoleFilter('admin');
    this.usersState.clearFilters();

    // CRUD operations
    this.usersState.loadUsuarios();
    this.usersState.createUsuario(userData);
    this.usersState.updateUsuario(id, userData);
    this.usersState.deleteUsuario(id);
  }
}
```

### ItemsStateService

Maneja el estado de items/productos:

```typescript
import { inject } from '@angular/core';
import { ItemsStateService } from './services/data-access/items-service/items-state.service';

export class MenuComponent {
  itemsState = inject(ItemsStateService);

  ngOnInit() {
    // Leer estado
    const items = this.itemsState.items();
    const categorias = this.itemsState.categorias();

    // Computed signals
    const filtrados = this.itemsState.itemsFiltrados();
    const disponibles = this.itemsState.itemsDisponibles();
    const precioPromedio = this.itemsState.precioPromedio();
    const porCategoria = this.itemsState.itemsPorCategoria();
    const masCaros = this.itemsState.itemsMasCaros();
    const masBaratos = this.itemsState.itemsMasBaratos();

    // Filtros
    this.itemsState.setSearchTerm('Lomo');
    this.itemsState.setCategoriaFilter('Fondos');
    this.itemsState.setShowOnlyDisponibles(true);
    this.itemsState.toggleShowOnlyDisponibles();

    // CRUD
    this.itemsState.loadItems();
    this.itemsState.createItem(itemData);
    this.itemsState.updateItem(id, itemData);
    this.itemsState.deleteItem(id);
  }
}
```

## Guards con Signals

Los guards ahora usan los computed signals del AuthService:

### authGuard - Protección básica

```typescript
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./dashboard/dashboard.component')
  }
];
```

### roleGuard - Protección por roles

```typescript
import { roleGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'admin',
    canActivate: [roleGuard(['admin'])],
    loadComponent: () => import('./admin/admin.component')
  },
  {
    path: 'cashier',
    canActivate: [roleGuard(['admin', 'cashier'])],
    loadComponent: () => import('./cashier/cashier.component')
  }
];
```

### Guards específicos

```typescript
import { adminGuard, cashierGuard, cookerGuard, waiterGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: 'admin', canActivate: [adminGuard], ... },
  { path: 'cashier', canActivate: [cashierGuard], ... },
  { path: 'kitchen', canActivate: [cookerGuard], ... },
  { path: 'orders', canActivate: [waiterGuard], ... }
];
```

## Ejemplos de Componentes

Revisa estos componentes de ejemplo para aprender más:

- `examples/login-example.component.ts` - Login con signals
- `examples/users-list-example.component.ts` - Lista de usuarios con filtros
- `examples/items-menu-example.component.ts` - Menú de items con estadísticas

## Mejores Prácticas

### 1. Usar Signals para Estado Local

```typescript
import { signal, computed } from '@angular/core';

export class MyComponent {
  // ✅ Buen uso: estado local del componente
  private count = signal(0);
  readonly doubleCount = computed(() => this.count() * 2);

  increment() {
    this.count.update(n => n + 1);
  }
}
```

### 2. Usar Computed para Derivar Estado

```typescript
export class MyComponent {
  usersState = inject(UsersStateService);

  // ✅ Computed local derivado del estado global
  readonly activeAdmins = computed(() => {
    return this.usersState.usuarios()
      .filter(u => u.activo && u.rol?.nombre === 'admin');
  });
}
```

### 3. Effects para Efectos Secundarios

```typescript
import { effect } from '@angular/core';

export class MyComponent {
  authService = inject(AuthService);

  constructor() {
    // ✅ Reaccionar a cambios en signals
    effect(() => {
      const user = this.authService.currentUser();
      console.log('Usuario cambió:', user);

      // Puedes ejecutar lógica aquí
      if (user) {
        this.loadUserPreferences();
      }
    });
  }
}
```

### 4. Update vs Set

```typescript
// ❌ Evitar mutación directa
const users = signal([user1, user2]);
users().push(user3); // NO HACER ESTO

// ✅ Usar set para reemplazar
users.set([user1, user2, user3]);

// ✅ Usar update para transformar
users.update(current => [...current, user3]);
```

### 5. Readonly Signals

```typescript
export class MyService {
  // ✅ Private mutable, public readonly
  private _data = signal<Data[]>([]);
  readonly data = this._data.asReadonly();

  updateData(newData: Data[]) {
    this._data.set(newData);
  }
}
```

### 6. Signals en Templates

```html
<!-- ✅ Correcto: llamar como función -->
<div>{{ user() }}</div>

<!-- ❌ Incorrecto: no es un Observable -->
<div>{{ user | async }}</div>

<!-- ✅ Control flow moderno con signals -->
@if (isLoading()) {
  <spinner />
}

@for (item of items(); track item.id) {
  <item-card [item]="item" />
}
```

## Migración desde Observables

Si tienes código antiguo con Observables, así puedes migrarlo:

### Antes (Observables)

```typescript
export class OldComponent {
  user$ = new BehaviorSubject<User | null>(null);
  isAdmin$ = this.user$.pipe(
    map(user => user?.role === 'admin')
  );

  ngOnInit() {
    this.user$.subscribe(user => {
      console.log('User:', user);
    });
  }
}
```

### Después (Signals)

```typescript
export class NewComponent {
  private _user = signal<User | null>(null);
  readonly user = this._user.asReadonly();
  readonly isAdmin = computed(() => this.user()?.role === 'admin');

  constructor() {
    effect(() => {
      console.log('User:', this.user());
    });
  }
}
```

## Recursos Adicionales

- [Angular Signals Documentation](https://angular.dev/guide/signals)
- [Angular Signal Inputs](https://angular.dev/guide/signals/inputs)
- [Angular Signal Queries](https://angular.dev/guide/signals/queries)

## Notas Importantes

1. **Signals son síncronos**: A diferencia de Observables, los signals se actualizan síncronamente
2. **Computed son lazy**: Solo se recalculan cuando se leen
3. **Effects se ejecutan en zona Angular**: Perfecto para tracking y logging
4. **No reemplaza RxJS**: Para operaciones asíncronas complejas, sigue usando Observables

---

¡Disfruta usando Signals en Angular! 🚀
