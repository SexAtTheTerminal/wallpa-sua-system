import { Component, inject } from '@angular/core';
import { SidebarCasherComponent } from '../../../sidebar/features/sidebar-casher/sidebar-casher.component';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../auth/data-access/auth.service';

@Component({
  selector: 'app-view-cashier',
  standalone: true,
  imports: [SidebarCasherComponent, CommonModule, RouterLink],
  templateUrl: './view-cashier.component.html',
  styleUrl: './view-cashier.component.scss',
})
export class ViewCashierComponent {
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
