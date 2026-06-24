import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

export const adminGuard: CanActivateFn = (_route, _state) => {
  const router = inject(Router);
  const token = localStorage.getItem('access_token');
  const userStr = localStorage.getItem('user');

  if (!token || !userStr) {
    router.navigate(['/login']);
    return false;
  }

  // Por ahora permitimos a todos ver la página para pruebas
  return true;
};
