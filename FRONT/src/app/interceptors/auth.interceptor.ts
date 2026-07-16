import { HttpInterceptorFn } from '@angular/common/http';

/**
 * Interceptor que adjunta el token JWT (almacenado en sessionStorage)
 * a todas las peticiones HTTP salientes como "Authorization: Bearer <token>".
 * Registrado globalmente en app.config.ts con withInterceptors([authInterceptor]).
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const token = sessionStorage.getItem('access_token');
  if (token) {
    const cloned = req.clone({
      setHeaders: { Authorization: `Bearer ${token}` },
    });
    return next(cloned);
  }
  return next(req);
};
