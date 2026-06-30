import { Component, inject } from '@angular/core';
import { SidebarCookerComponent } from '../../../sidebar/features/sidebar-cooker/sidebar-cooker.component';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/data-access/auth.service';

@Component({
  selector: 'app-view-cooker',
  imports: [SidebarCookerComponent, CommonModule, RouterLink],
  templateUrl: './view-cooker.component.html',
  styleUrl: './view-cooker.component.scss',
})
export class ViewCookerComponent {
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
