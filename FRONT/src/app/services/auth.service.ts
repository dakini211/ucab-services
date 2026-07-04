import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: {
    id: number;
    email: string;
    nombre: string;
    rol: string;
  };
}

export interface ForgotPasswordRequest {
  email: string;
}

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000/api';

  /**
   * Inicia sesión con correo institucional y contraseña.
   * POST /api/auth/login
   */
  login(credentials: LoginRequest): Observable<LoginResponse> {
    return this.http
      .post<LoginResponse>(`${this.API_URL}/auth/login`, credentials)
      .pipe(
        tap((response) => {
          // Guarda el token en localStorage al iniciar sesión exitosamente
          localStorage.setItem('access_token', response.access_token);
          localStorage.setItem('user', JSON.stringify(response.user));
        }),
        catchError(this.handleError)
      );
  }

  /**
   * Solicita restablecimiento de contraseña.
   * POST /api/auth/forgot-password
   */
  forgotPassword(data: ForgotPasswordRequest): Observable<{ message: string }> {
    return this.http
      .post<{ message: string }>(`${this.API_URL}/auth/forgot-password`, data)
      .pipe(catchError(this.handleError));
  }

  /**
   * Cierra la sesión del usuario actual.
   */
  logout(): void {
    const token = this.getToken();
    if (token) {
      this.http.post(`${this.API_URL}/auth/logout`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      }).subscribe({
        next: () => this.clearSession(),
        error: () => this.clearSession()
      });
    } else {
      this.clearSession();
    }
  }

  private clearSession(): void {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
  }

  /**
   * Verifica si hay un usuario autenticado.
   */
  isAuthenticated(): boolean {
    return !!localStorage.getItem('access_token');
  }

  /**
   * Obtiene el token JWT almacenado.
   */
  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  private handleError(error: HttpErrorResponse): Observable<never> {
    let message = 'Ocurrió un error inesperado.';
    if (error.status === 401) {
      message = 'Correo o contraseña incorrectos.';
    } else if (error.status === 403) {
      message = 'No tienes permisos para acceder.';
    } else if (error.status === 0) {
      message = 'No se pudo conectar con el servidor. Verifica tu conexión.';
    } else if (error.error?.message) {
      message = error.error.message;
    }
    return throwError(() => new Error(message));
  }
}
