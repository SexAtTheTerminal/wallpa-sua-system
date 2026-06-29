import { Component, inject, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UsersStateService } from '../services/data-access/users-service/users-state.service';

/**
 * EJEMPLO de componente de Lista de Usuarios usando Signals
 *
 * Este componente demuestra cómo usar el UsersStateService con signals
 */
@Component({
  selector: 'app-users-list-example',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="users-container">
      <h2>Gestión de Usuarios</h2>

      <!-- Estadísticas -->
      <div class="stats">
        <div class="stat-card">
          <h4>Total Usuarios</h4>
          <p class="stat-number">{{ usersState.totalUsuarios() }}</p>
        </div>
        <div class="stat-card">
          <h4>Activos</h4>
          <p class="stat-number">{{ usersState.usuariosActivos() }}</p>
        </div>
        <div class="stat-card">
          <h4>Inactivos</h4>
          <p class="stat-number">{{ usersState.usuariosInactivos() }}</p>
        </div>
        <div class="stat-card">
          <h4>Filtrados</h4>
          <p class="stat-number">{{ usersState.totalUsuariosFiltrados() }}</p>
        </div>
      </div>

      <!-- Distribución por rol -->
      <div class="roles-distribution">
        <h3>Distribución por Rol</h3>
        @for (rol of Object.keys(usersState.usuariosPorRol()); track rol) {
          <div class="role-stat">
            <span class="role-name">{{ rol }}:</span>
            <span class="role-count">{{ usersState.usuariosPorRol()[rol] }}</span>
          </div>
        }
      </div>

      <!-- Filtros -->
      <div class="filters">
        <div class="filter-group">
          <label>Buscar:</label>
          <input
            type="text"
            [value]="usersState.searchTerm()"
            (input)="onSearchChange($event)"
            placeholder="Buscar por nombre, apellido o email..."
          />
        </div>

        <div class="filter-group">
          <label>Filtrar por rol:</label>
          <select
            [value]="usersState.selectedRole() || ''"
            (change)="onRoleFilterChange($event)"
          >
            <option value="">Todos los roles</option>
            @for (rol of usersState.roles(); track rol.id) {
              <option [value]="rol.nombre">{{ rol.nombre }}</option>
            }
          </select>
        </div>

        @if (usersState.searchTerm() || usersState.selectedRole()) {
          <button (click)="clearFilters()" class="clear-btn">
            Limpiar Filtros
          </button>
        }
      </div>

      <!-- Loading indicator -->
      @if (usersState.loading()) {
        <div class="loading">Cargando usuarios...</div>
      }

      <!-- Error message -->
      @if (usersState.error()) {
        <div class="error-message">
          {{ usersState.error() }}
          <button (click)="clearError()">×</button>
        </div>
      }

      <!-- Lista de usuarios -->
      @if (usersState.hasUsuarios() && !usersState.loading()) {
        <div class="users-list">
          <table>
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Email</th>
                <th>Rol</th>
                <th>Estado</th>
                <th>Fecha Registro</th>
              </tr>
            </thead>
            <tbody>
              @for (usuario of usersState.usuariosFiltrados(); track usuario.id) {
                <tr [class.inactive]="!usuario.activo">
                  <td>{{ usuario.nombre }} {{ usuario.apellido }}</td>
                  <td>{{ usuario.email }}</td>
                  <td>
                    <span class="role-badge" [class]="'role-' + usuario.rol?.nombre">
                      {{ usuario.rol?.nombre }}
                    </span>
                  </td>
                  <td>
                    <span [class]="usuario.activo ? 'status-active' : 'status-inactive'">
                      {{ usuario.activo ? 'Activo' : 'Inactivo' }}
                    </span>
                  </td>
                  <td>{{ usuario.fechaRegistro | date:'short' }}</td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="5" class="no-results">
                    No se encontraron usuarios con los filtros aplicados
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      } @else if (!usersState.loading()) {
        <div class="no-users">
          No hay usuarios registrados
        </div>
      }

      <button (click)="reloadUsers()" class="reload-btn">
        Recargar Usuarios
      </button>
    </div>
  `,
  styles: [`
    .users-container {
      padding: 20px;
    }

    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }

    .stat-card {
      padding: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border-radius: 8px;
      text-align: center;
    }

    .stat-card h4 {
      margin: 0 0 10px 0;
      font-size: 14px;
      opacity: 0.9;
    }

    .stat-number {
      font-size: 32px;
      font-weight: bold;
      margin: 0;
    }

    .roles-distribution {
      background: #f5f5f5;
      padding: 15px;
      border-radius: 8px;
      margin-bottom: 20px;
    }

    .role-stat {
      display: flex;
      justify-content: space-between;
      padding: 8px 0;
      border-bottom: 1px solid #ddd;
    }

    .role-stat:last-child {
      border-bottom: none;
    }

    .filters {
      display: flex;
      gap: 15px;
      margin-bottom: 20px;
      flex-wrap: wrap;
    }

    .filter-group {
      flex: 1;
      min-width: 200px;
    }

    .filter-group label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }

    .filter-group input,
    .filter-group select {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    .clear-btn {
      padding: 8px 16px;
      background-color: #ff9800;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
      align-self: flex-end;
    }

    .loading {
      text-align: center;
      padding: 20px;
      color: #666;
    }

    .error-message {
      background-color: #fee;
      color: #c00;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .error-message button {
      background: none;
      border: none;
      color: #c00;
      font-size: 20px;
      cursor: pointer;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      background: white;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }

    th {
      background-color: #f5f5f5;
      font-weight: bold;
    }

    tr.inactive {
      opacity: 0.6;
    }

    .role-badge {
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: bold;
    }

    .role-admin { background-color: #f44336; color: white; }
    .role-cashier { background-color: #4caf50; color: white; }
    .role-cooker { background-color: #ff9800; color: white; }
    .role-waiter { background-color: #2196f3; color: white; }

    .status-active { color: #4caf50; font-weight: bold; }
    .status-inactive { color: #f44336; font-weight: bold; }

    .no-results,
    .no-users {
      text-align: center;
      padding: 40px;
      color: #666;
    }

    .reload-btn {
      margin-top: 20px;
      padding: 10px 20px;
      background-color: #2196f3;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }
  `]
})
export class UsersListExampleComponent {
  readonly usersState = inject(UsersStateService);

  // Exponer Object.keys para usarlo en el template
  Object = Object;

  // Effect para logging (ejemplo de uso de effect)
  constructor() {
    effect(() => {
      console.log('Usuarios filtrados actualizados:', this.usersState.usuariosFiltrados().length);
    });
  }

  onSearchChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    this.usersState.setSearchTerm(input.value);
  }

  onRoleFilterChange(event: Event): void {
    const select = event.target as HTMLSelectElement;
    this.usersState.setRoleFilter(select.value || null);
  }

  clearFilters(): void {
    this.usersState.clearFilters();
  }

  clearError(): void {
    this.usersState.clearError();
  }

  reloadUsers(): void {
    this.usersState.loadUsuarios();
  }
}
