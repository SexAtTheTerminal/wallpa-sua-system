import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../auth.service';

export const notFoundRedirectGuard: CanActivateFn = () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Llamar al signal como función
  const role = authService.currentRole();

  switch (role) {
    case 'cooker':
      router.navigateByUrl('/cooker');
      break;
    case 'cashier':
      router.navigateByUrl('/cashier');
      break;
    case 'admin':
      router.navigateByUrl('/admin');
      break;
    case 'waiter':
      router.navigateByUrl('/waiter');
      break;
    default:
      router.navigateByUrl('/auth/log-in');
      break;
  }

  return false;
};
