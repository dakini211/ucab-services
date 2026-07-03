import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Edificacion {
  id: number;
  codigo: string;
  nombre: string;
  sede: string;
  direccion_interna: string;
  estado: 'activa' | 'desactivada';
}

export interface EdificacionesResponse {
  data: Edificacion[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EdificacionStats {
  totalSedes: number;
  totalEdificaciones: number;
  activas: number;
  inactivas: number;
}

export interface CreateEdificacionDto {
  codigo: string;
  nombre: string;
  sede: string;
  direccion_interna: string;
  estado?: 'activa' | 'desactivada';
}

@Injectable({ providedIn: 'root' })
export class EdificacionesService {
  private readonly http = inject(HttpClient);
  private readonly API = 'http://localhost:3000/api';

  getAll(params: {
    search?: string;
    sede?: string;
    page?: number;
    limit?: number;
  }): Observable<EdificacionesResponse> {
    let httpParams = new HttpParams();
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.sede) httpParams = httpParams.set('sede', params.sede);
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    return this.http.get<EdificacionesResponse>(`${this.API}/edificacion`, { params: httpParams });
  }

  getStats(): Observable<EdificacionStats> {
    return this.http.get<EdificacionStats>(`${this.API}/edificacion/stats`);
  }

  getSedes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API}/edificacion/sedes`);
  }

  getOne(id: number): Observable<Edificacion> {
    return this.http.get<Edificacion>(`${this.API}/edificacion/${id}`);
  }

  create(dto: CreateEdificacionDto): Observable<Edificacion> {
    return this.http.post<Edificacion>(`${this.API}/edificacion`, dto);
  }

  update(id: number, dto: Partial<CreateEdificacionDto>): Observable<Edificacion> {
    return this.http.patch<Edificacion>(`${this.API}/edificacion/${id}`, dto);
  }

  updateEstado(id: number, estado: 'activa' | 'desactivada'): Observable<Edificacion> {
    return this.http.patch<Edificacion>(`${this.API}/edificacion/${id}/estado`, { estado });
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/edificacion/${id}`);
  }
}
