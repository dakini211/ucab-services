import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Servicio {
  id: number;
  nombre: string;
  descripcion: string;
  categoria: string;
  sede: string;
  tipo: 'Digital' | 'Presencial';
  precio_base: number | null;
  estado: 'Publicado' | 'Borrador';
}

export interface ServiciosResponse {
  data: Servicio[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateServicioDto {
  nombre: string;
  descripcion: string;
  categoria: string;
  sede: string;
  tipo: 'Digital' | 'Presencial';
  precio_base?: number | null;
  estado?: 'Publicado' | 'Borrador';
}

@Injectable({ providedIn: 'root' })
export class CatalogoService {
  private readonly http = inject(HttpClient);
  private readonly API = 'http://localhost:3000/api';

  getAll(params: {
    search?: string;
    categoria?: string;
    sede?: string;
    estado?: string;
    tipo?: string;
    page?: number;
    limit?: number;
  }): Observable<ServiciosResponse> {
    let p = new HttpParams();
    if (params.search)    p = p.set('search',    params.search);
    if (params.categoria) p = p.set('categoria', params.categoria);
    if (params.sede)      p = p.set('sede',      params.sede);
    if (params.estado)    p = p.set('estado',    params.estado);
    if (params.tipo)      p = p.set('tipo',      params.tipo);
    if (params.page)      p = p.set('page',      params.page.toString());
    if (params.limit)     p = p.set('limit',     params.limit.toString());
    return this.http.get<ServiciosResponse>(`${this.API}/servicio`, { params: p });
  }

  getCategorias(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API}/servicio/categorias`);
  }

  getSedes(): Observable<string[]> {
    return this.http.get<string[]>(`${this.API}/servicio/sedes`);
  }

  getOne(id: number): Observable<Servicio> {
    return this.http.get<Servicio>(`${this.API}/servicio/${id}`);
  }

  create(dto: CreateServicioDto): Observable<Servicio> {
    return this.http.post<Servicio>(`${this.API}/servicio`, dto);
  }

  update(id: number, dto: Partial<CreateServicioDto>): Observable<Servicio> {
    return this.http.patch<Servicio>(`${this.API}/servicio/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.API}/servicio/${id}`);
  }

  solicitar(id: number): Observable<{ mensaje: string }> {
    return this.http.post<{ mensaje: string }>(`${this.API}/servicio/${id}/solicitar`, {});
  }
}
