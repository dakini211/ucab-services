import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, catchError, of } from 'rxjs';
import { map } from 'rxjs/operators';

/* ── Interfaces ─────────────────────────────────────────── */

export interface DashboardStats {
  totalMiembros: number;
  totalServicios: number;
  solicitudesActivas: number;
  pagosPendientes: number;
}

export interface ActividadReciente {
  id: number;
  tipo: 'solicitud' | 'miembro' | 'aprobacion' | 'pago' | 'reservacion';
  titulo: string;
  descripcion: string;
  fecha: string;
  hora: string;
}

export interface UserProfile {
  id: number;
  nombre: string;
  email: string;
  rol: string;
  ultima_conexion?: string;
  avatar?: string;
}

export interface NotificacionCount {
  count: number;
}

/* ── Mock data (fallback cuando el backend no responde) ─── */

const MOCK_ACTIVIDAD: ActividadReciente[] = [
  {
    id: 1,
    tipo: 'solicitud',
    titulo: 'Nueva solicitud creada',
    descripcion: 'Solicitud de préstamo de espacio - Aula 204',
    fecha: 'Hoy',
    hora: '09:15 a.m.',
  },
  {
    id: 2,
    tipo: 'miembro',
    titulo: 'Miembro registrado',
    descripcion: 'Juan Pérez se ha registrado en la plataforma',
    fecha: 'Ayer',
    hora: '04:32 p.m.',
  },
  {
    id: 3,
    tipo: 'aprobacion',
    titulo: 'Solicitud aprobada',
    descripcion: 'Servicio de apoyo logístico aprobado',
    fecha: 'Ayer',
    hora: '11:07 a.m.',
  },
  {
    id: 4,
    tipo: 'pago',
    titulo: 'Pago registrado',
    descripcion: 'Pago de servicio consolidado #FS-2025-0458',
    fecha: '13 may',
    hora: '03:21 p.m.',
  },
  {
    id: 5,
    tipo: 'reservacion',
    titulo: 'Espacio reservado',
    descripcion: 'Sala de Reuniones - Torre A reservada',
    fecha: '12 may',
    hora: '10:45 a.m.',
  },
];

const MOCK_USER: UserProfile = {
  id: 1,
  nombre: 'María Gabriela',
  email: 'mgonzalez@ucab.edu.ve',
  rol: 'Administrador',
  ultima_conexion: 'Hoy, 08:24 a.m.',
};

/* ── Service ────────────────────────────────────────────── */

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);
  private readonly API_URL = 'http://localhost:3000/api';

  /**
   * Obtiene el conteo de miembros registrados.
   * GET /api/miembros/count
   */
  getMiembrosCount(): Observable<{ count: number }> {
    return this.http
      .get<{ count: number }>(`${this.API_URL}/miembros/count`)
      .pipe(catchError(() => of({ count: 1248 })));
  }

  /**
   * Obtiene el conteo de servicios disponibles.
   * GET /api/servicios/count
   */
  getServiciosCount(): Observable<{ count: number }> {
    return this.http
      .get<{ count: number }>(`${this.API_URL}/servicios/count`)
      .pipe(catchError(() => of({ count: 86 })));
  }

  /**
   * Obtiene el conteo de solicitudes activas.
   * GET /api/solicitudes/activas/count
   */
  getSolicitudesActivasCount(): Observable<{ count: number }> {
    return this.http
      .get<{ count: number }>(`${this.API_URL}/solicitudes/activas/count`)
      .pipe(catchError(() => of({ count: 12 })));
  }

  /**
   * Obtiene el conteo de pagos pendientes.
   * GET /api/pagos/pendientes/count
   */
  getPagosPendientesCount(): Observable<{ count: number }> {
    return this.http
      .get<{ count: number }>(`${this.API_URL}/pagos/pendientes/count`)
      .pipe(catchError(() => of({ count: 5 })));
  }

  /**
   * Obtiene todas las estadísticas del dashboard en paralelo.
   */
  getDashboardStats(): Observable<DashboardStats> {
    return forkJoin({
      miembros: this.getMiembrosCount(),
      servicios: this.getServiciosCount(),
      solicitudes: this.getSolicitudesActivasCount(),
      pagos: this.getPagosPendientesCount(),
    }).pipe(
      map((res) => ({
        totalMiembros: res.miembros.count,
        totalServicios: res.servicios.count,
        solicitudesActivas: res.solicitudes.count,
        pagosPendientes: res.pagos.count,
      }))
    );
  }

  /**
   * Obtiene la actividad reciente de la plataforma.
   * GET /api/actividad?limit=5
   */
  getActividadReciente(limit = 5): Observable<ActividadReciente[]> {
    return this.http
      .get<ActividadReciente[]>(`${this.API_URL}/actividad?limit=${limit}`)
      .pipe(catchError(() => of(MOCK_ACTIVIDAD)));
  }

  /**
   * Obtiene el perfil del usuario autenticado.
   * GET /api/auth/me
   */
  getUserProfile(): Observable<UserProfile> {
    const token = localStorage.getItem('access_token');
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    return this.http.get<UserProfile>(`${this.API_URL}/auth/me`, { headers }).pipe(
      catchError(() => {
        const stored = localStorage.getItem('user');
        return of(stored ? (JSON.parse(stored) as UserProfile) : MOCK_USER);
      })
    );
  }

  /**
   * Obtiene el conteo de notificaciones no leídas.
   * GET /api/notificaciones/no-leidas/count
   */
  getNotificacionesCount(): Observable<NotificacionCount> {
    return this.http
      .get<NotificacionCount>(`${this.API_URL}/notificaciones/no-leidas/count`)
      .pipe(catchError(() => of({ count: 3 })));
  }
}
