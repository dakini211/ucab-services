import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, forkJoin } from 'rxjs';

export interface KpisGenerales {
  totalMiembros: number;
  miembrosPorTipo: { tipo: string; total: number }[];
  miembrosPorEstado: { estado: string; total: number }[];
  beneficiarios: { total: number; cargoMayor: number; cargoMenor: number };
}

export interface ReporteServicios {
  totalServicios: number;
  solicitudesPorEstado: { estado: string; total: number }[];
  serviciosMasSolicitados: { id_servicio: number; nombre: string; costo: number; totalSolicitudes: number }[];
}

export interface ReporteInfraestructura {
  totalEdificaciones: number;
  totalEspacios: number;
  espaciosPorEstado: { estado: string; total: number }[];
  recursosTecnologicos: { estado: string; total: number }[];
}

export interface ReporteFinanzas {
  foliosPorEstado: { estado: string; total: number }[];
  billeteras: { totalBilleteras: number; saldoTotal: number; saldoPromedio: number };
  tasasCambioRecientes: { par: string; tasa: number; fecha: string }[];
}

export interface ReporteOfertas {
  totalOfertas: number;
  ofertasPorEstatus: { estatus: string; total: number }[];
  topOfertasMasPostuladas: { entidad: string; cargo: string; totalPostulaciones: number }[];
}

export interface ResumenCompleto {
  generadoEn: string;
  kpisGenerales: KpisGenerales;
  servicios: ReporteServicios;
  infraestructura: ReporteInfraestructura;
  finanzas: ReporteFinanzas;
  ofertasLaborales: ReporteOfertas;
  alertas: string[];
}

export interface OpcionesFiltro {
  estadosSolicitud: string[];
  estadosFolio: string[];
  tiposEspacio: string[];
  edificaciones: string[];
  estatusOferta: string[];
  entidades: string[];
  paresMonedas: string[];
}

export interface FiltroServicios { estado?: string; desde?: string; hasta?: string; }
export interface FiltroInfraestructura { tipo?: string; edificacion?: string; }
export interface FiltroFinanzas { estado?: string; desde?: string; hasta?: string; moneda?: string; }
export interface FiltroOfertas { estatus?: string; entidad?: string; }

function toHttpParams(filtro: object): HttpParams {
  let params = new HttpParams();
  for (const [key, value] of Object.entries(filtro)) {
    if (value) params = params.set(key, value as string);
  }
  return params;
}

@Injectable({ providedIn: 'root' })
export class ReportesService {
  private readonly http = inject(HttpClient);
  private readonly API = 'http://localhost:3000/api/reportes';

  getKpis(): Observable<KpisGenerales> {
    return this.http.get<KpisGenerales>(`${this.API}/kpis`);
  }

  getServicios(filtro: FiltroServicios = {}): Observable<ReporteServicios> {
    return this.http.get<ReporteServicios>(`${this.API}/servicios`, { params: toHttpParams(filtro) });
  }

  getInfraestructura(filtro: FiltroInfraestructura = {}): Observable<ReporteInfraestructura> {
    return this.http.get<ReporteInfraestructura>(`${this.API}/infraestructura`, { params: toHttpParams(filtro) });
  }

  getFinanzas(filtro: FiltroFinanzas = {}): Observable<ReporteFinanzas> {
    return this.http.get<ReporteFinanzas>(`${this.API}/finanzas`, { params: toHttpParams(filtro) });
  }

  getOfertasLaborales(filtro: FiltroOfertas = {}): Observable<ReporteOfertas> {
    return this.http.get<ReporteOfertas>(`${this.API}/ofertas-laborales`, { params: toHttpParams(filtro) });
  }

  /** Valores reales de la BD para poblar los <select> de filtro */
  getOpcionesFiltro(): Observable<OpcionesFiltro> {
    return this.http.get<OpcionesFiltro>(`${this.API}/opciones-filtro`);
  }

  /** Endpoint unificado — Base para generación masiva con IA */
  getResumenCompleto(): Observable<ResumenCompleto> {
    return this.http.get<ResumenCompleto>(`${this.API}/resumen-completo`);
  }

  /** Carga todos los bloques en paralelo (más eficiente que resumen-completo en desarrollo) */
  getTodosLosReportes() {
    return forkJoin({
      kpis: this.getKpis(),
      servicios: this.getServicios(),
      infraestructura: this.getInfraestructura(),
      finanzas: this.getFinanzas(),
      ofertas: this.getOfertasLaborales(),
    });
  }
}
