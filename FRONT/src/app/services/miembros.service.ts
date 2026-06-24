import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Miembro {
  id: number;
  cedula: string;
  nombre: string;
  correo: string;
  telefono?: string;
  fecha_nacimiento?: string;
  estado_cuenta: 'activa' | 'suspendida' | 'bloqueada';
  tipo_vinculacion: string;
  total_sesiones: number;
}

export interface MiembrosResponse {
  data: Miembro[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateMiembroDto {
  cedula_identidad: number;
  primer_nombre: string;
  segundo_nombre?: string;
  primer_apellido: string;
  segundo_apellido?: string;
  fecha_nacimiento: string;
  telefono?: string;
  correo_institucional: string;
  direccion_habitacion?: string;
  estado_cuenta?: string;
  total_sesiones?: number;
}

@Injectable({ providedIn: 'root' })
export class MiembrosService {
  private readonly http = inject(HttpClient);
  private readonly API = 'http://localhost:3000/api';

  getAll(params: {
    search?: string;
    tipoVinculacion?: string;
    estadoCuenta?: string;
    page?: number;
    limit?: number;
  }): Observable<MiembrosResponse> {
    let httpParams = new HttpParams();
    if (params.search) httpParams = httpParams.set('search', params.search);
    if (params.tipoVinculacion) httpParams = httpParams.set('tipoVinculacion', params.tipoVinculacion);
    if (params.estadoCuenta) httpParams = httpParams.set('estadoCuenta', params.estadoCuenta);
    if (params.page) httpParams = httpParams.set('page', params.page.toString());
    if (params.limit) httpParams = httpParams.set('limit', params.limit.toString());
    return this.http.get<MiembrosResponse>(`${this.API}/miembro`, { params: httpParams });
  }

  getOne(id: number): Observable<Miembro> {
    return this.http.get<Miembro>(`${this.API}/miembro/${id}`);
  }

  create(dto: CreateMiembroDto): Observable<Miembro> {
    return this.http.post<Miembro>(`${this.API}/miembro`, dto);
  }

  update(id: number, dto: Partial<CreateMiembroDto>): Observable<Miembro> {
    return this.http.patch<Miembro>(`${this.API}/miembro/${id}`, dto);
  }

  updateEstado(id: number, estado: string): Observable<Miembro> {
    return this.http.patch<Miembro>(`${this.API}/miembro/${id}/estado`, { estado });
  }

  delete(id: number): Observable<Miembro> {
    return this.http.delete<Miembro>(`${this.API}/miembro/${id}`);
  }
}
