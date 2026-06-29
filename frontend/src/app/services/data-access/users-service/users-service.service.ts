import { Injectable, inject } from '@angular/core';
import { ApiService } from '../../../shared/data-access/api.service';
import { Observable } from 'rxjs';
import { Usuario, CreateUsuarioDto, UpdateUsuarioDto, Rol } from '../../../shared/models/user.model';

@Injectable({
  providedIn: 'root'
})
export class UsersServiceService {
  private apiService = inject(ApiService);

  constructor() { }

  /**
   * Obtener todos los usuarios
   */
  obtenerUsuariosDesdeDB(): Observable<Usuario[]> {
    return this.apiService.get<Usuario[]>('usuarios');
  }

  /**
   * Crear un nuevo usuario
   */
  crearUsuarioCompleto(usuarioData: CreateUsuarioDto): Observable<Usuario> {
    return this.apiService.post<Usuario>('usuarios', usuarioData);
  }

  /**
   * Actualizar un usuario existente
   */
  actualizarUsuarioCompleto(id: string, usuarioData: UpdateUsuarioDto): Observable<Usuario> {
    return this.apiService.put<Usuario>(`usuarios/${id}`, usuarioData);
  }

  /**
   * Eliminar un usuario
   */
  eliminarUsuarioCompleto(id: string): Observable<{ message: string }> {
    return this.apiService.delete<{ message: string }>(`usuarios/${id}`);
  }

  /**
   * Obtener todos los roles disponibles
   */
  obtenerRoles(): Observable<Rol[]> {
    return this.apiService.get<Rol[]>('usuarios/roles');
  }
}