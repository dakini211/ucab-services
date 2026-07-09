import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/**
 * Guard para usuarios no autenticados (Guest).
 * Si hay access_token en sessionStorage, redirige al dashboard.
 */
export const guestGuard: CanActivateFn = (_route, _state) => {
  const router = inject(Router);
  const token = sessionStorage.getItem('access_token');

  if (token) {
    router.navigate(['/dashboard']);
    return false;
  }

  return true;
};
