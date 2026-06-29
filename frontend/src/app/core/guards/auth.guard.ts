import { inject } from '@angular/core';
import { Router, type CanActivateFn } from '@angular/router';
import { AuthService } from '../../auth/data-access/auth.service';

/**
 * Guard para proteger rutas que requieren autenticación
 * Usa signals del AuthService
 */
export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Usar el computed signal isAuthenticated
  if (authService.isAuthenticated()) {
    return true;
  }

  // Guardar la URL intentada para redirigir después del login
  const returnUrl = state.url;
  router.navigate(['/login'], {
    queryParams: { returnUrl }
  });

  return false;
};

/**
 * Guard para proteger rutas según el rol del usuario
 */
export const roleGuard = (allowedRoles: string[]): CanActivateFn => {
  return (route, state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    // Verificar autenticación
    if (!authService.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }

    // Verificar rol usando el signal
    const currentRole = authService.currentRole();
    if (currentRole && allowedRoles.includes(currentRole)) {
      return true;
    }

    // Redirigir a página de acceso denegado
    router.navigate(['/access-denied']);
    return false;
  };
};

/**
 * Guard específico para administradores
 */
export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Usar el computed signal isAdmin
  if (authService.isAdmin()) {
    return true;
  }

  router.navigate(['/access-denied']);
  return false;
};

/**
 * Guard para cajeros
 */
export const cashierGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  // Usar el computed signal isCashier o isAdmin (admin puede acceder a todo)
  if (authService.isCashier() || authService.isAdmin()) {
    return true;
  }

  router.navigate(['/access-denied']);
  return false;
};

/**
 * Guard para cocineros
 */
export const cookerGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (authService.isCooker() || authService.isAdmin()) {
    return true;
  }

  router.navigate(['/access-denied']);
  return false;
};

/**
 * Guard para mozos
 */
export const waiterGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated()) {
    router.navigate(['/login']);
    return false;
  }

  if (authService.isWaiter() || authService.isAdmin()) {
    return true;
  }

  router.navigate(['/access-denied']);
  return false;
};
