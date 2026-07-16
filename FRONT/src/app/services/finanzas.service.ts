import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

const BASE = 'http://localhost:3000/api';

// ── Modelos ─────────────────────────────────────────────────────────────────

/** Clave primaria compuesta del folio (heredada de solicitud_servicio). */
export interface FolioKey {
  id_miembro: number | string;
  id_servicio: number;
  fecha_de_creacion: string;
  nro_de_folio: string;
}

export interface Folio extends FolioKey {
  estado: 'abierto' | 'facturado';
  fecha_inicio_mes: string;
  fecha_fin_mes: string | null;
  miembro: string;
  cedula_identidad: number;
  nombre_servicio: string;
  total: number;
  cantidad_items: number;
  numero_de_control: string | null;
}

export interface Factura extends FolioKey {
  numero_de_control: string;
  fecha_de_emision: string;
  estatus: 'pendiente' | 'parcial' | 'pagada' | 'anulada';
  saldo: number;
  miembro: string;
  cedula_identidad: number;
  correo_institucional?: string;
  nombre_servicio: string;
  total: number;
  pagado: number;
  saldo_recalculado?: number;
}

export interface ItemConsumo {
  concepto: string;
  cantidad: number;
  impuesto_ley: number;
  precio_unitario: number;
  subtotal?: number;
  impuesto?: number;
  total_linea: number;
  tarifa_hoy?: number;
}

export interface Pago {
  fecha_operacion: string;
  monto: number;
  tipo: string;
  referencia: string | null;
}

export interface DetalleFactura {
  factura: Factura;
  items: ItemConsumo[];
  pagos: Pago[];
}

export interface FinanzasStats {
  folios_abiertos: number;
  facturas_pendientes: number;
  facturas_parciales: number;
  facturas_pagadas: number;
  por_cobrar: number;
}

export interface SolicitudSinFolio {
  id_miembro: number;
  id_servicio: number;
  fecha_de_creacion: string;
  estado: string;
  miembro: string;
  cedula_identidad: number;
  nombre_servicio: string;
}

/** Mismo contrato que devuelven ServicioService y MiembroService en el back. */
export interface Paginado<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export type TipoPago = 'zelle' | 'tarjeta' | 'pago_movil' | 'efectivo' | 'cripto' | 'tai';

export interface RegistrarPagoDto {
  numero_de_control: string;
  monto: number;
  tipo: TipoPago;
  fecha_operacion?: string | null;
  correo?: string | null;
  nombre?: string | null;
  confirmacion?: string | null;
  nro_tarjeta?: string | null;
  vencimiento?: string | null;
  compania?: string | null;
  red?: string | null;
  telefono_emisor?: string | null;
  banco?: string | null;
  referencia?: string | null;
  tasa?: number | null;
  dxid?: string | null;
  billetera?: string | null;
  uid?: string | null;
  pos?: string | null;
}

export interface ResultadoPago {
  numero_de_control: string;
  estatus: string;
  saldo: number;
  mensaje: string;
}

export interface GetListaParams {
  search?: string;
  estado?: string;
  estatus?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  order?: 'asc' | 'desc';
}

// ── Service ─────────────────────────────────────────────────────────────────

@Injectable({ providedIn: 'root' })
export class FinanzasService {
  private readonly http = inject(HttpClient);

  private construirParams(params: GetListaParams): HttpParams {
    let p = new HttpParams();
    if (params.search) p = p.set('search', params.search);
    if (params.estado && params.estado !== 'todos') p = p.set('estado', params.estado);
    if (params.estatus && params.estatus !== 'todos') p = p.set('estatus', params.estatus);
    if (params.page) p = p.set('page', params.page.toString());
    if (params.limit) p = p.set('limit', params.limit.toString());
    if (params.sortBy) p = p.set('sortBy', params.sortBy);
    if (params.order) p = p.set('order', params.order);
    return p;
  }

  private paramsDeFolio(k: FolioKey): HttpParams {
    return new HttpParams()
      .set('id_miembro', k.id_miembro.toString())
      .set('id_servicio', k.id_servicio.toString())
      .set('fecha_de_creacion', k.fecha_de_creacion)
      .set('nro_de_folio', k.nro_de_folio);
  }

  // ── Folios ─────────────────────────────────────────────────

  getFolios(params: GetListaParams = {}): Observable<Paginado<Folio>> {
    return this.http.get<Paginado<Folio>>(`${BASE}/folio`, {
      params: this.construirParams(params),
    });
  }

  getStats(): Observable<FinanzasStats> {
    return this.http.get<FinanzasStats>(`${BASE}/folio/stats`);
  }

  getSolicitudesSinFolio(): Observable<SolicitudSinFolio[]> {
    return this.http.get<SolicitudSinFolio[]>(`${BASE}/folio/solicitudes-sin-folio`);
  }

  getItemsDeFolio(k: FolioKey): Observable<ItemConsumo[]> {
    return this.http.get<ItemConsumo[]>(`${BASE}/folio/items`, {
      params: this.paramsDeFolio(k),
    });
  }

  abrirFolio(dto: {
    id_miembro: number | string;
    id_servicio: number;
    fecha_de_creacion: string;
    fecha_inicio_mes?: string | null;
  }): Observable<{ ok: boolean; mensaje: string }> {
    return this.http.post<{ ok: boolean; mensaje: string }>(`${BASE}/folio`, dto);
  }

  facturarFolio(k: FolioKey): Observable<{
    numero_de_control: string;
    estatus: string;
    saldo: number;
  }> {
    return this.http.post<any>(`${BASE}/folio/facturar`, k);
  }

  /** Cierre masivo mensual (regla pág. 7 del enunciado). */
  cierreMasivo(mes: string | null): Observable<{
    ok: boolean;
    facturados: number;
    omitidos: number;
    mensaje: string;
  }> {
    return this.http.post<any>(`${BASE}/folio/cierre-masivo`, { mes });
  }

  // ── Ítems de consumo ───────────────────────────────────────

  /**
   * precio_unitario en null => el trigger trg_congelar_precio_item lo toma de
   * Historico_Tarifa y lo congela a la fecha del cargo. El front no elige
   * precios salvo para conceptos suplementarios sin tarifa propia.
   */
  agregarItem(dto: {
    id_miembro: number | string;
    id_servicio: number;
    fecha_de_creacion: string;
    nro_de_folio: string;
    concepto: string;
    cantidad: number;
    impuesto_ley?: number | null;
    precio_unitario?: number | null;
  }): Observable<{ ok: boolean; mensaje: string }> {
    return this.http.post<any>(`${BASE}/items-consumo`, dto);
  }

  eliminarItem(k: FolioKey & { concepto: string }): Observable<{ ok: boolean }> {
    const params = this.paramsDeFolio(k).set('concepto', k.concepto);
    return this.http.delete<{ ok: boolean }>(`${BASE}/items-consumo`, { params });
  }

  eliminarFolio(k: FolioKey): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${BASE}/folio`, { params: this.paramsDeFolio(k) });
  }

  // ── Facturas ───────────────────────────────────────────────

  getFacturas(params: GetListaParams = {}): Observable<Paginado<Factura>> {
    return this.http.get<Paginado<Factura>>(`${BASE}/factura`, {
      params: this.construirParams(params),
    });
  }

  getFactura(numero: string): Observable<DetalleFactura> {
    return this.http.get<DetalleFactura>(`${BASE}/factura/${encodeURIComponent(numero)}`);
  }

  eliminarFactura(numero: string): Observable<{ message: string }> {
    return this.http.delete<{ message: string }>(`${BASE}/factura/${encodeURIComponent(numero)}`);
  }

  // ── Pagos ──────────────────────────────────────────────────

  /**
   * El saldo y el estatus los recalcula el trigger trg_actualizar_saldo_factura.
   * Este método solo envía el abono; la respuesta trae lo que decidió la BD.
   */
  registrarPago(dto: RegistrarPagoDto): Observable<ResultadoPago> {
    return this.http.post<ResultadoPago>(`${BASE}/metodo-pago`, dto);
  }

  getPagosDeFactura(numero: string): Observable<Pago[]> {
    return this.http.get<Pago[]>(`${BASE}/metodo-pago/factura/${encodeURIComponent(numero)}`);
  }
}
