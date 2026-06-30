import { Injectable, inject, signal, computed } from '@angular/core';
import { ApiService } from '../../shared/data-access/api.service';
import { Observable, tap, catchError, of } from 'rxjs';
import { LoginRequest, LoginResponse, Usuario } from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly apiService = inject(ApiService);

  private readonly _rolKey = 'user-role';
  private readonly _userKey = 'current-user';

  // Signals para estado reactivo
  private readonly _currentUser = signal<Usuario | null>(this.getCurrentUserFromStorage());
  private readonly _currentRole = signal<string | null>(localStorage.getItem(this._rolKey));

  // Signals públicos (readonly)
  readonly currentUser = this._currentUser.asReadonly();
  readonly currentRole = this._currentRole.asReadonly();

  // Computed signals
  readonly isAuthenticated = computed(() => {
    const token = this.apiService.getToken();
    const user = this._currentUser();
    return !!token && !!user;
  });

  readonly userName = computed(() => {
    const user = this._currentUser();
    return user ? `${user.nombre} ${user.apellido}` : 'Invitado';
  });

  readonly isAdmin = computed(() => this._currentRole() === 'admin');
  readonly isCashier = computed(() => this._currentRole() === 'cashier');
  readonly isCooker = computed(() => this._currentRole() === 'cooker');
  readonly isWaiter = computed(() => this._currentRole() === 'waiter');

  private getCurrentUserFromStorage(): Usuario | null {
    const userStr = localStorage.getItem(this._userKey);
    return userStr ? JSON.parse(userStr) : null;
  }

  private setCurrentUser(user: Usuario | null): void {
    this._currentUser.set(user);
    if (user) {
      localStorage.setItem(this._userKey, JSON.stringify(user));
    } else {
      localStorage.removeItem(this._userKey);
    }
  }

  private setCurrentRole(role: string | null): void {
    this._currentRole.set(role);
    if (role) {
      localStorage.setItem(this._rolKey, role);
    } else {
      localStorage.removeItem(this._rolKey);
    }
  }

  /**
   * Login con email y password
   */
  logIn(credentials: LoginRequest): Observable<LoginResponse> {
    return this.apiService.post<LoginResponse>('auth/login', credentials).pipe(
      tap((response) => {
        // Guardar token
        this.apiService.setToken(response.access_token);

        // Guardar rol y usuario usando signals
        this.setCurrentRole(response.user.rol);
        this.setCurrentUser(response.user as any);
      }),
      catchError((error) => {
        console.error('Error en login:', error);
        throw error;
      })
    );
  }

  /**
   * Obtener perfil del usuario actual
   */
  getUserProfile(): Observable<Usuario> {
    return this.apiService.get<Usuario>('auth/profile').pipe(
      tap((user) => {
        this.setCurrentUser(user);
        if (user.rol) {
          this.setCurrentRole(user.rol.nombre);
        }
      })
    );
  }

  /**
   * Verificar si el rol es válido
   */
  verifyRoleOrSignOut(): Observable<boolean | Usuario> {
    if (!this.isAuthenticated()) {
      this.signOut();
      return of(false);
    }

    return this.getUserProfile().pipe(
      tap((user) => {
        const dbRole = user.rol?.nombre;
        const localRole = this._currentRole();

        if (!dbRole || localRole !== dbRole) {
          throw new Error('Rol inválido o manipulado');
        }
      }),
      tap(() => true),
      catchError((error) => {
        console.warn('Verificación fallida, cerrando sesión:', error);
        this.signOut();
        return of(false);
      })
    );
  }

  /**
   * Cerrar sesión
   */
  signOut(): void {
    this.setCurrentRole(null);
    this.setCurrentUser(null);
    this.apiService.removeToken();
  }

  /**
   * Registro de nuevo usuario (si se necesita desde el frontend)
   */
  signUp(userData: any): Observable<Usuario> {
    return this.apiService.post<Usuario>('usuarios', userData);
  }
}
