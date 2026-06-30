import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { SidebarAdminComponent } from '../../../sidebar/features/sidebar-admin/sidebar-admin.component';
import { UsersServiceService } from '../../../services/data-access/users-service/users-service.service';
import { TablaUsuariosComponent } from '../../../shared/modals/tabla-usuarios/tabla-usuarios.component';
import { FiltrosUsuariosComponent } from '../../../shared/modals/filtros-usuarios/filtros-usuarios.component';
import { UserRegistrationComponent } from '../../../shared/modals/user-registration/user-registration.component';

@Component({
  selector: 'app-record',
  imports: [
    SidebarAdminComponent,
    CommonModule,
    RouterLink,
    TablaUsuariosComponent,
    FiltrosUsuariosComponent,
    UserRegistrationComponent,
  ],
  templateUrl: './record.component.html',
  styleUrl: './record.component.scss',
})
export class RecordComponent {
  sidebarCollapsed = false;

  // Filtros
  busquedaCodigo = '';
  busquedaNombre = '';
  filtroCargo = '';

  // Datos
  usuarios: any[] = [];
  usuariosFiltrados: any[] = [];

  // UI
  mensajeExito = '';
  modalAbierto = false;
  usuarioParaEditar: any = null;

  constructor(private readonly usersService: UsersServiceService) {}

  ngOnInit() {
    // La verificación de autenticación la manejan los guards de Angular
    this.cargarUsuarios();
  }

  cargarUsuarios() {
    this.usersService.obtenerUsuariosDesdeDB().subscribe({
      next: (usuarios) => {
        this.usuarios = usuarios;
        this.aplicarFiltros();
      },
      error: (error) => {
        console.error('Error al cargar usuarios:', error);
        alert('Error al cargar usuarios');
      }
    });
  }

  aplicarFiltros(): void {
    let resultados = [...this.usuarios];

    if (this.busquedaCodigo) {
      const searchTerm = this.busquedaCodigo.toLowerCase();

      if (this.filtroCargo === 'Nombre y Apellidos') {
        resultados = resultados.filter((u) =>
          `${u.nombre} ${u.apellido}`.toLowerCase().includes(searchTerm)
        );
      } else if (this.filtroCargo === 'Correo Electrónico') {
        resultados = resultados.filter((u) =>
          u.email.toLowerCase().includes(searchTerm)
        );
      } else {
        // Búsqueda general en nombre, apellido y email
        resultados = resultados.filter((u) =>
          `${u.nombre} ${u.apellido} ${u.email}`.toLowerCase().includes(searchTerm)
        );
      }
    }

    this.usuariosFiltrados = resultados;
  }

  editarUsuario(usuario: any): void {
    this.usuarioParaEditar = usuario;
    this.modalAbierto = true;
  }

  eliminarUsuario(usuario: any): void {
    const confirmado = confirm(
      `¿Estás seguro de eliminar al usuario ${usuario.nombre} ${usuario.apellido}?`
    );
    if (!confirmado) return;

    this.usersService.eliminarUsuarioCompleto(usuario.id).subscribe({
      next: () => {
        this.mostrarMensajeExito('Usuario eliminado correctamente');
        this.cargarUsuarios();
      },
      error: (error) => {
        console.error('Error al eliminar usuario:', error);
        alert(`Error al eliminar usuario: ${error?.error?.message || 'Error desconocido'}`);
      }
    });
  }

  crearUsuario(): void {
    this.usuarioParaEditar = null;
    this.modalAbierto = true;
  }

  cerrarModal(): void {
    this.modalAbierto = false;
    this.usuarioParaEditar = null;
  }

  onUsuarioGuardado() {
    this.cargarUsuarios();
    this.mostrarMensajeExito(
      this.usuarioParaEditar
        ? 'Usuario actualizado exitosamente'
        : 'Usuario creado exitosamente'
    );
    this.modalAbierto = false;
    this.usuarioParaEditar = null;
  }

  mostrarMensajeExito(mensaje: string): void {
    this.mensajeExito = mensaje;
    setTimeout(() => (this.mensajeExito = ''), 3000);
  }

  reiniciarFiltros() {
    this.busquedaCodigo = '';
    this.busquedaNombre = '';
    this.filtroCargo = '';
    this.cargarUsuarios();
  }

  onSidebarToggle(state: boolean): void {
    this.sidebarCollapsed = state;
  }
}