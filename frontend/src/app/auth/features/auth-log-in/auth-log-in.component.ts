import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import {
  FormBuilder,
  Validators,
  FormControl,
  ReactiveFormsModule,
} from '@angular/forms';
import { AuthService } from '../../data-access/auth.service';

interface LogInForm {
  email: FormControl<string | null>;
  password: FormControl<string | null>;
}

@Component({
  selector: 'app-auth-log-in',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule],
  templateUrl: `./auth-log-in.component.html`,
  styleUrl: './auth-log-in.component.scss',
})
export default class AuthLogInComponent {
  private readonly _formBuilder = inject(FormBuilder);

  private readonly _authService = inject(AuthService);

  private readonly _router = inject(Router);

  form = this._formBuilder.group<LogInForm>({
    email: this._formBuilder.control(null, [
      Validators.required,
      Validators.email,
    ]),

    password: this._formBuilder.control(null, [Validators.required]),
  });

  //Submission method

  submit() {
    if (this.form.invalid) return;

    this._authService.logIn({
      email: this.form.value.email ?? '',
      password: this.form.value.password ?? '',
    }).subscribe({
      next: (response) => {
        // response contiene { access_token, user }
        const rol = response.user.rol;

        // Redirigir según rol
        switch (rol) {
          case 'cooker':
            this._router.navigateByUrl('/cooker');
            break;
          case 'cashier':
            this._router.navigateByUrl('/cashier');
            break;
          case 'admin':
            this._router.navigateByUrl('/admin');
            break;
          case 'waiter':
            this._router.navigateByUrl('/waiter');
            break;
          default:
            this._router.navigateByUrl('/');
            break;
        }
      },
      error: (error) => {
        console.error('Error al iniciar sesión:', error);
      }
    });
  }
}
