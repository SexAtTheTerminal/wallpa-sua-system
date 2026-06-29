import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../auth/data-access/auth.service';

/**
 * EJEMPLO de componente de Login usando Signals
 *
 * Este componente demuestra cómo usar el AuthService con signals
 */
@Component({
  selector: 'app-login-example',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <h2>Iniciar Sesión</h2>

      <!-- Mostrar nombre de usuario si está autenticado -->
      @if (authService.isAuthenticated()) {
        <div class="user-info">
          <p>Bienvenido, {{ authService.userName() }}</p>
          <p>Rol: {{ authService.currentRole() }}</p>
          <button (click)="onLogout()">Cerrar Sesión</button>
        </div>
      } @else {
        <!-- Formulario de login -->
        <form (ngSubmit)="onLogin()">
          <div class="form-group">
            <label>Email</label>
            <input
              type="email"
              [(ngModel)]="email"
              name="email"
              required
              [disabled]="loading()"
            />
          </div>

          <div class="form-group">
            <label>Contraseña</label>
            <input
              type="password"
              [(ngModel)]="password"
              name="password"
              required
              [disabled]="loading()"
            />
          </div>

          <!-- Mostrar error si existe -->
          @if (errorMessage()) {
            <div class="error-message">
              {{ errorMessage() }}
            </div>
          }

          <button
            type="submit"
            [disabled]="loading() || !email || !password"
          >
            @if (loading()) {
              Cargando...
            } @else {
              Iniciar Sesión
            }
          </button>
        </form>
      }

      <!-- Mostrar permisos según el rol -->
      @if (authService.isAuthenticated()) {
        <div class="permissions">
          <h3>Permisos:</h3>
          <ul>
            @if (authService.isAdmin()) {
              <li>✅ Acceso total (Admin)</li>
            }
            @if (authService.isCashier()) {
              <li>💰 Gestión de cobros (Cajero)</li>
            }
            @if (authService.isCooker()) {
              <li>👨‍🍳 Gestión de cocina (Cocinero)</li>
            }
            @if (authService.isWaiter()) {
              <li>🍽️ Gestión de pedidos (Mozo)</li>
            }
          </ul>
        </div>
      }
    </div>
  `,
  styles: [`
    .login-container {
      max-width: 400px;
      margin: 50px auto;
      padding: 20px;
      border: 1px solid #ddd;
      border-radius: 8px;
    }

    .form-group {
      margin-bottom: 15px;
    }

    label {
      display: block;
      margin-bottom: 5px;
      font-weight: bold;
    }

    input {
      width: 100%;
      padding: 8px;
      border: 1px solid #ddd;
      border-radius: 4px;
    }

    button {
      width: 100%;
      padding: 10px;
      background-color: #007bff;
      color: white;
      border: none;
      border-radius: 4px;
      cursor: pointer;
    }

    button:disabled {
      background-color: #ccc;
      cursor: not-allowed;
    }

    .error-message {
      color: red;
      margin: 10px 0;
      padding: 10px;
      background-color: #fee;
      border-radius: 4px;
    }

    .user-info {
      background-color: #e8f5e9;
      padding: 15px;
      border-radius: 4px;
      margin-bottom: 20px;
    }

    .permissions {
      margin-top: 20px;
      padding: 15px;
      background-color: #f5f5f5;
      border-radius: 4px;
    }

    .permissions ul {
      list-style: none;
      padding: 0;
    }

    .permissions li {
      padding: 5px 0;
    }
  `]
})
export class LoginExampleComponent {
  readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  // Signals locales del componente
  email = signal('');
  password = signal('');
  loading = signal(false);
  errorMessage = signal<string | null>(null);

  onLogin(): void {
    if (!this.email() || !this.password()) {
      this.errorMessage.set('Por favor complete todos los campos');
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    this.authService.logIn({
      email: this.email(),
      password: this.password()
    }).subscribe({
      next: () => {
        this.loading.set(false);
        // Redirigir según el rol
        if (this.authService.isAdmin()) {
          this.router.navigate(['/admin']);
        } else if (this.authService.isCashier()) {
          this.router.navigate(['/cashier']);
        } else if (this.authService.isCooker()) {
          this.router.navigate(['/kitchen']);
        } else if (this.authService.isWaiter()) {
          this.router.navigate(['/orders']);
        }
      },
      error: (error) => {
        this.loading.set(false);
        this.errorMessage.set(
          error.error?.message || 'Error al iniciar sesión. Verifique sus credenciales.'
        );
        console.error('Error en login:', error);
      }
    });
  }

  onLogout(): void {
    this.authService.signOut();
    this.email.set('');
    this.password.set('');
  }
}
