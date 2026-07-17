import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/**
 * Guard del módulo de Reportes.
 * Solo Admin (administrativo con admin_general) puede entrar.
 */
export const reportesGuard: CanActivateFn = (_route, _state) => {
  const router = inject(Router);
  const token = sessionStorage.getItem('access_token');
  const userStr = sessionStorage.getItem('user');

  if (!token || !userStr) {
    router.navigate(['/login']);
    return false;
  }

  try {
    const user = JSON.parse(userStr);
    if (user.rol === 'Admin') {
      return true;
    }
    router.navigate(['/dashboard']);
    return false;
  } catch {
    router.navigate(['/login']);
    return false;
  }
};
