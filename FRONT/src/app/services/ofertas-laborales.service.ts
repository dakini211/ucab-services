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
  /** Cantidad de miembros postulados. */
  cantidad_postulantes: number;
}

/** Mismo contrato PLANO que devuelven ServicioService y MiembroService. */
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
  sortBy?: string;
  order?: 'asc' | 'desc';
}

// ── Service ─────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class OfertasLaboralesService {
  private readonly http = inject(HttpClient);
  private readonly API = 'http://localhost:3000/api';

  getAll(params: GetOfertasParams = {}): Observable<OfertasLaboralesResponse> {
    let p = new HttpParams();
    if (params.search)  p = p.set('search', params.search);
    if (params.estatus && params.estatus !== 'todos') p = p.set('estatus', params.estatus);
    if (params.page)    p = p.set('page', params.page.toString());
    if (params.limit)   p = p.set('limit', params.limit.toString());
    if (params.sortBy)  p = p.set('sortBy', params.sortBy);
    if (params.order)   p = p.set('order', params.order);
    return this.http.get<OfertasLaboralesResponse>(`${this.API}/ofertas_laborales`, { params: p });
  }

  getOne(nombre_entidad: string, cargo: string): Observable<OfertaLaboral> {
    const p = new HttpParams()
      .set('nombre_entidad', nombre_entidad)
      .set('cargo', cargo);
    return this.http.get<OfertaLaboral>(`${this.API}/ofertas_laborales/detail`, { params: p });
  }

  getStats(): Observable<OfertasStats> {
    return this.http.get<OfertasStats>(`${this.API}/ofertas_laborales/stats`);
  }

  /**
   * Postula al miembro autenticado (el backend lo toma del JWT).
   * Los errores de negocio llegan en err.error.error.
   *
   * RUTA CAMBIADA: antes era POST /api/oferta, ahora vive bajo el módulo
   * unificado de ofertas laborales.
   */
  aplicar(nombre_entidad: string, cargo: string): Observable<{ ok: boolean; mensaje: string }> {
    return this.http.post<{ ok: boolean; mensaje: string }>(
      `${this.API}/ofertas_laborales/postular`,
      { nombre_entidad, cargo },
    );
  }

  /** RUTA CAMBIADA: antes era GET /api/oferta/mis-postulaciones. */
  misPostulaciones(): Observable<Postulacion[]> {
    return this.http.get<Postulacion[]>(`${this.API}/ofertas_laborales/mis-postulaciones`);
  }

  /** Vacantes sugeridas según el perfil del miembro (fn_ofertas_sugeridas). */
  sugeridas(): Observable<OfertaLaboral[]> {
    return this.http.get<OfertaLaboral[]>(`${this.API}/ofertas_laborales/sugeridas`);
  }
}
