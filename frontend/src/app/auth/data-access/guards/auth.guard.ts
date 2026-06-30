import { inject } from '@angular/core';
import { AuthService } from '../auth.service';
import { CanActivateFn, Router } from '@angular/router';

export const privateGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Usar el computed signal isAuthenticated
  if (authService.isAuthenticated()) {
    return true;
  }

  // Guardar la URL intentada para redirigir después del login
  const returnUrl = state.url;
  router.navigate(['/auth/log-in'], {
    queryParams: { returnUrl }
  });

  return false;
};

export const publicGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Si el usuario ya está autenticado, redirigir al dashboard
  if (authService.isAuthenticated()) {
    router.navigateByUrl('/');
    return false;
  }

  return true;
};
