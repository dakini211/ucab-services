import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

/**
 * Guard del módulo de Ofertas Laborales.
 * Solo Estudiante (consulta y postula) y Admin/admin_general (solo consulta)
 * pueden entrar. Profesor, Administrativo y Egresado quedan fuera.
 */
export const ofertasLaboralesGuard: CanActivateFn = (_route, _state) => {
  const router = inject(Router);
  const token = sessionStorage.getItem('access_token');
  const userStr = sessionStorage.getItem('user');

  if (!token || !userStr) {
    router.navigate(['/login']);
    return false;
  }

  try {
    const user = JSON.parse(userStr);
    if (user.rol === 'Estudiante' || user.rol === 'Admin') {
      return true;
    }
    router.navigate(['/dashboard']);
    return false;
  } catch {
    router.navigate(['/login']);
    return false;
  }
};
