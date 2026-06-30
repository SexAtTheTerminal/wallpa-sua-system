import { Component, inject } from '@angular/core';
import { SidebarAdminComponent } from '../../../sidebar/features/sidebar-admin/sidebar-admin.component';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/data-access/auth.service';

@Component({
  selector: 'app-view-admin',
  standalone: true,
  imports: [SidebarAdminComponent, CommonModule, RouterLink],
  templateUrl: './view-admin.component.html',
  styleUrl: './view-admin.component.scss',
})
export class ViewAdminComponent {
  sidebarCollapsed = false;
  userData: any;

  private readonly authService = inject(AuthService);

  ngOnInit() {
    // La verificación de autenticación la manejan los guards de Angular
    // Obtener datos del usuario actual desde el AuthService
    this.userData = this.authService.currentUser();
  }

  onSidebarToggle(state: boolean): void {
    this.sidebarCollapsed = state;
  }
}
