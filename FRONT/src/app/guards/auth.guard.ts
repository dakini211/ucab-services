import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/**
 * Guard de autenticación.
 * Si no hay access_token en sessionStorage, redirige al login.
 */
export const authGuard: CanActivateFn = (_route, _state) => {
  const router = inject(Router);
  const token = sessionStorage.getItem('access_token');

  if (!token) {
    router.navigate(['/login']);
    return false;
  }

  return true;
};
