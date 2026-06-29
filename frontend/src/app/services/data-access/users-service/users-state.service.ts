import { Injectable, inject, signal, computed } from '@angular/core';
import { UsersServiceService } from './users-service.service';
import { Usuario, Rol } from '../../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UsersStateService {
  private readonly usersService = inject(UsersServiceService);

  // Signals para estado
  private readonly _usuarios = signal<Usuario[]>([]);
  private readonly _roles = signal<Rol[]>([]);
  private readonly _loading = signal<boolean>(false);
  private readonly _error = signal<string | null>(null);
  private readonly _searchTerm = signal<string>('');
  private readonly _selectedRole = signal<string | null>(null);

  // Signals públicos (readonly)
  readonly usuarios = this._usuarios.asReadonly();
  readonly roles = this._roles.asReadonly();
  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly searchTerm = this._searchTerm.asReadonly();
  readonly selectedRole = this._selectedRole.asReadonly();

  // Computed signals
  readonly usuariosFiltrados = computed(() => {
    const usuarios = this._usuarios();
    const search = this._searchTerm().toLowerCase();
    const roleFilter = this._selectedRole();

    let filtered = usuarios;

    // Filtrar por búsqueda
    if (search) {
      filtered = filtered.filter(u =>
        u.nombre.toLowerCase().includes(search) ||
        u.apellido.toLowerCase().includes(search) ||
        u.email.toLowerCase().includes(search)
      );
    }

    // Filtrar por rol
    if (roleFilter) {
      filtered = filtered.filter(u => u.rol?.nombre === roleFilter);
    }

    return filtered;
  });

  readonly totalUsuarios = computed(() => this._usuarios().length);
  readonly totalUsuariosFiltrados = computed(() => this.usuariosFiltrados().length);
  readonly usuariosActivos = computed(() => this._usuarios().filter(u => u.activo).length);
  readonly usuariosInactivos = computed(() => this._usuarios().filter(u => !u.activo).length);

  readonly hasUsuarios = computed(() => this._usuarios().length > 0);
  readonly hasError = computed(() => this._error() !== null);

  // Estadísticas por rol
  readonly usuariosPorRol = computed(() => {
    const usuarios = this._usuarios();
    const stats: Record<string, number> = {};

    usuarios.forEach(u => {
      if (u.rol) {
        const rolNombre = u.rol.nombre;
        stats[rolNombre] = (stats[rolNombre] || 0) + 1;
      }
    });

    return stats;
  });

  constructor() {
    // Cargar datos iniciales
    this.loadUsuarios();
    this.loadRoles();
  }

  /**
   * Cargar usuarios desde el API
   */
  loadUsuarios(): void {
    this._loading.set(true);
    this._error.set(null);

    this.usersService.obtenerUsuariosDesdeDB().subscribe({
      next: (usuarios) => {
        this._usuarios.set(usuarios);
        this._loading.set(false);
      },
      error: (error) => {
        this._error.set(error.message || 'Error al cargar usuarios');
        this._loading.set(false);
        console.error('Error cargando usuarios:', error);
      }
    });
  }

  /**
   * Cargar roles desde el API
   */
  loadRoles(): void {
    this.usersService.obtenerRoles().subscribe({
      next: (roles) => {
        this._roles.set(roles);
      },
      error: (error) => {
        console.error('Error cargando roles:', error);
      }
    });
  }

  /**
   * Crear un nuevo usuario
   */
  createUsuario(usuarioData: any): void {
    this._loading.set(true);
    this._error.set(null);

    this.usersService.crearUsuarioCompleto(usuarioData).subscribe({
      next: (nuevoUsuario) => {
        // Agregar el nuevo usuario a la lista
        this._usuarios.update(usuarios => [...usuarios, nuevoUsuario]);
        this._loading.set(false);
      },
      error: (error) => {
        this._error.set(error.message || 'Error al crear usuario');
        this._loading.set(false);
        console.error('Error creando usuario:', error);
      }
    });
  }

  /**
   * Actualizar un usuario existente
   */
  updateUsuario(id: string, usuarioData: any): void {
    this._loading.set(true);
    this._error.set(null);

    this.usersService.actualizarUsuarioCompleto(id, usuarioData).subscribe({
      next: (usuarioActualizado) => {
        // Actualizar el usuario en la lista
        this._usuarios.update(usuarios =>
          usuarios.map(u => u.id === id ? usuarioActualizado : u)
        );
        this._loading.set(false);
      },
      error: (error) => {
        this._error.set(error.message || 'Error al actualizar usuario');
        this._loading.set(false);
        console.error('Error actualizando usuario:', error);
      }
    });
  }

  /**
   * Eliminar un usuario
   */
  deleteUsuario(id: string): void {
    this._loading.set(true);
    this._error.set(null);

    this.usersService.eliminarUsuarioCompleto(id).subscribe({
      next: () => {
        // Remover el usuario de la lista
        this._usuarios.update(usuarios => usuarios.filter(u => u.id !== id));
        this._loading.set(false);
      },
      error: (error) => {
        this._error.set(error.message || 'Error al eliminar usuario');
        this._loading.set(false);
        console.error('Error eliminando usuario:', error);
      }
    });
  }

  /**
   * Establecer término de búsqueda
   */
  setSearchTerm(term: string): void {
    this._searchTerm.set(term);
  }

  /**
   * Establecer filtro de rol
   */
  setRoleFilter(role: string | null): void {
    this._selectedRole.set(role);
  }

  /**
   * Limpiar filtros
   */
  clearFilters(): void {
    this._searchTerm.set('');
    this._selectedRole.set(null);
  }

  /**
   * Limpiar error
   */
  clearError(): void {
    this._error.set(null);
  }
}
