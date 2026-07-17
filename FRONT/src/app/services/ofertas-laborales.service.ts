import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

// ── Modelos ─────────────────────────────────────────────────────────────────

export interface OfertaLaboral {
  nombre_entidad: string;
  cargo: string;
  responsabilidades: string;
  beneficios: string;
  perfil_buscado: string;
  fecha_oferta: string;
  estatus_vacante: 'disponible' | 'finalizada';
  razon_social: string;
  rif: string;
  /** Cantidad de miembros postulados. Solo la usa la vista de admin_general. */
  cantidad_postulantes: number;
}

export interface OfertasLaboralesResponse {
  data: OfertaLaboral[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface OfertasStats {
  total_ofertas: number;
  ofertas_disponibles: number;
  ofertas_con_postulantes: number;
  total_postulaciones: number;
}

export interface Postulacion {
  nombre_entidad: string;
  cargo: string;
  estatus_vacante: string;
  razon_social: string;
}

export interface GetOfertasParams {
  search?: string;
  estatus?: string;
  page?: number;
  limit?: number;
}

// ── Service ─────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class OfertasLaboralesService {
  private readonly http = inject(HttpClient);
  private readonly API = 'http://localhost:3000/api';

  getAll(params: GetOfertasParams = {}): Observable<OfertasLaboralesResponse> {
    let p = new HttpParams();
    if (params.search)  p = p.set('search', params.search);
    if (params.estatus) p = p.set('estatus', params.estatus);
    if (params.page)    p = p.set('page', params.page.toString());
    if (params.limit)   p = p.set('limit', params.limit.toString());
    return this.http.get<OfertasLaboralesResponse>(`${this.API}/ofertas_laborales`, { params: p });
  }

  getOne(nombre_entidad: string, cargo: string): Observable<OfertaLaboral> {
    const p = new HttpParams()
      .set('nombre_entidad', nombre_entidad)
      .set('cargo', cargo);
    return this.http.get<OfertaLaboral>(`${this.API}/ofertas_laborales/detail`, { params: p });
  }

  /** Solo accesible para admin_general (rol 'Admin'). */
  getStats(): Observable<OfertasStats> {
    return this.http.get<OfertasStats>(`${this.API}/ofertas_laborales/stats`);
  }

  /**
   * Postula al miembro autenticado (tomado del JWT en el backend) a la oferta.
   * Los errores de negocio llegan en err.error.error.
   */
  aplicar(nombre_entidad: string, cargo: string): Observable<{ ok: boolean; mensaje: string }> {
    return this.http.post<{ ok: boolean; mensaje: string }>(`${this.API}/oferta`, { nombre_entidad, cargo });
  }

  misPostulaciones(): Observable<Postulacion[]> {
    return this.http.get<Postulacion[]>(`${this.API}/oferta/mis-postulaciones`);
  }
}
