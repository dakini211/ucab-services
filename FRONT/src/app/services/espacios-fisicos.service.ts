import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const BASE = 'http://localhost:3000/api';

// ── Interfaces ──────────────────────────────────────────────────────────────

export interface RecursoTecnologico {
  id: number;
  nombre: string;
  tipo: string;   // 'proyector' | 'microfono' | 'parlante' | 'computadora' | 'wifi' | etc.
  disponible: boolean;
  cantidad: number;
}

export interface EspacioFisico {
  id: number;
  numero: string;          // e.g. "A-101"
  edificacion: string;     // e.g. "Aula Magna"
  tipo_espacio: string;    // e.g. "Auditorio"
  capacidad: number;
  disponibilidad: 'Disponible' | 'Parcialmente disponible' | 'No disponible';
  sede: string;
  descripcion?: string;
  recursos_tecnologicos: RecursoTecnologico[];
}

export interface PaginatedEspacios {
  data: EspacioFisico[];
  total: number;
  totalPages: number;
  page: number;
}

export interface GetEspaciosParams {
  search?: string;
  sede?: string;
  edificacion?: string;
  tipo_espacio?: string;
  disponibilidad?: string;
  page?: number;
  limit?: number;
}

export interface CreateEspacioDto {
  numero: string;
  edificacion: string;
  tipo_espacio: string;
  capacidad: number;
  disponibilidad: string;
  sede: string;
  descripcion?: string;
}

export interface ReservaCalendario {
  id: number;
  titulo: string;
  organizacion: string;
  fecha_inicio: string;   // ISO
  fecha_fin: string;      // ISO
  color?: string;
}

// ── Service ─────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class EspaciosFisicosService {
  private readonly http = inject(HttpClient);

  // ── Espacios ───────────────────────────────────────────────

  getAll(params: GetEspaciosParams = {}): Observable<PaginatedEspacios> {
    let p = new HttpParams();
    if (params.search)        p = p.set('search',        params.search);
    if (params.sede)          p = p.set('sede',          params.sede);
    if (params.edificacion)   p = p.set('edificacion',   params.edificacion);
    if (params.tipo_espacio)  p = p.set('tipo_espacio',  params.tipo_espacio);
    if (params.disponibilidad) p = p.set('disponibilidad', params.disponibilidad);
    if (params.page)          p = p.set('page',          params.page.toString());
    if (params.limit)         p = p.set('limit',         params.limit.toString());
    return this.http.get<PaginatedEspacios>(`${BASE}/espacio-fisico`, { params: p });
  }

  getById(id: number): Observable<EspacioFisico> {
    return this.http.get<EspacioFisico>(`${BASE}/espacio-fisico/${id}`);
  }

  create(dto: CreateEspacioDto): Observable<EspacioFisico> {
    return this.http.post<EspacioFisico>(`${BASE}/espacio-fisico`, dto);
  }

  update(id: number, dto: Partial<CreateEspacioDto>): Observable<EspacioFisico> {
    return this.http.put<EspacioFisico>(`${BASE}/espacio-fisico/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${BASE}/espacio-fisico/${id}`);
  }

  // ── Filtros auxiliares ─────────────────────────────────────

  getSedes(): Observable<string[]> {
    return this.http.get<string[]>(`${BASE}/espacio-fisico/sedes`);
  }

  getEdificaciones(sede?: string): Observable<string[]> {
    const params = sede ? new HttpParams().set('sede', sede) : new HttpParams();
    return this.http.get<string[]>(`${BASE}/espacio-fisico/edificaciones`, { params });
  }

  getTipos(): Observable<string[]> {
    return this.http.get<string[]>(`${BASE}/espacio-fisico/tipos`);
  }

  // ── Disponibilidad / Reservas ──────────────────────────────

  marcarDisponible(id: number): Observable<EspacioFisico> {
    return this.http.patch<EspacioFisico>(`${BASE}/espacio-fisico/${id}/disponibilidad`, { disponibilidad: 'Disponible' });
  }

  reservar(id: number, payload: { fecha_inicio: string; fecha_fin: string; motivo: string }): Observable<any> {
    return this.http.post<any>(`${BASE}/espacio-fisico/${id}/reservar`, payload);
  }

  getReservas(id: number, mes?: number, anio?: number): Observable<ReservaCalendario[]> {
    let p = new HttpParams();
    if (mes)  p = p.set('mes', mes.toString());
    if (anio) p = p.set('anio', anio.toString());
    return this.http.get<ReservaCalendario[]>(`${BASE}/espacio-fisico/${id}/reservas`, { params: p });
  }
}
