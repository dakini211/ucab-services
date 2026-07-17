import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ReportesService {
  constructor(private prisma: PrismaService) {}

  /* ══════════════════════════════════════════════════════════
   * BLOQUE 1 — KPIs Generales
   * ══════════════════════════════════════════════════════════ */
  async getKpisGenerales() {
    const [
      totalMiembros,
      estudiantes, profesores, administrativos, egresados,
      miembrosPorEstado,
      totalFamiliares,
      familiaresCargoMayor,
      familiaresCargoMenor,
    ] = await Promise.all([
      this.prisma.miembro.count(),
      this.prisma.estudiante.count(),
      this.prisma.profesor.count(),
      this.prisma.administrativo.count(),
      this.prisma.egresado.count(),
      this.prisma.miembro.groupBy({ by: ['estado_cuenta'], _count: { _all: true } }),
      this.prisma.familiar.count(),
      this.prisma.cargo_mayor.count(),
      this.prisma.cargo_menor.count(),
    ]);

    return {
      totalMiembros,
      miembrosPorTipo: [
        { tipo: 'Estudiantes', total: estudiantes },
        { tipo: 'Profesores', total: profesores },
        { tipo: 'Administrativos', total: administrativos },
        { tipo: 'Egresados', total: egresados },
      ],
      miembrosPorEstado: miembrosPorEstado.map((r) => ({
        estado: r.estado_cuenta,
        total: r._count._all,
      })),
      beneficiarios: {
        total: totalFamiliares,
        cargoMayor: familiaresCargoMayor,
        cargoMenor: familiaresCargoMenor,
      },
    };
  }

  /* ══════════════════════════════════════════════════════════
   * BLOQUE 2 — Servicios y Solicitudes
   * ══════════════════════════════════════════════════════════ */
  async getReporteServicios(filtros: { estado?: string; desde?: string; hasta?: string } = {}) {
    const where: any = {};
    if (filtros.estado) where.estado = filtros.estado;
    if (filtros.desde || filtros.hasta) {
      where.fecha_de_creacion = {};
      if (filtros.desde) where.fecha_de_creacion.gte = new Date(filtros.desde);
      if (filtros.hasta) where.fecha_de_creacion.lte = new Date(`${filtros.hasta}T23:59:59`);
    }

    const [
      totalServicios,
      solicitudesPorEstado,
      serviciosMasSolicitados,
    ] = await Promise.all([
      this.prisma.servicio.count(),
      this.prisma.solicitud_servicio.groupBy({
        by: ['estado'],
        where,
        _count: { _all: true },
        orderBy: { _count: { estado: 'desc' } },
      }),
      this.prisma.solicitud_servicio.groupBy({
        by: ['id_servicio'],
        where,
        _count: { _all: true },
        orderBy: { _count: { id_servicio: 'desc' } },
        take: 10,
      }),
    ]);

    // Enriquecer con nombre del servicio
    const servicioIds = serviciosMasSolicitados.map((s) => s.id_servicio);
    const serviciosData = await this.prisma.servicio.findMany({
      where: { id_servicio: { in: servicioIds } },
      select: { id_servicio: true, nombre_servicio: true, costo: true },
    });
    const serviciosMap = new Map(serviciosData.map((s) => [s.id_servicio, s]));

    return {
      totalServicios,
      solicitudesPorEstado: solicitudesPorEstado.map((r) => ({
        estado: r.estado,
        total: r._count._all,
      })),
      serviciosMasSolicitados: serviciosMasSolicitados.map((r) => ({
        id_servicio: r.id_servicio,
        nombre: serviciosMap.get(r.id_servicio)?.nombre_servicio ?? '—',
        costo: Number(serviciosMap.get(r.id_servicio)?.costo ?? 0),
        totalSolicitudes: r._count._all,
      })),
    };
  }

  /* ══════════════════════════════════════════════════════════
   * BLOQUE 3 — Infraestructura (Edificaciones & Espacios)
   * ══════════════════════════════════════════════════════════ */
  async getReporteInfraestructura(filtros: { tipo?: string; edificacion?: string } = {}) {
    const whereEspacios: any = {};
    if (filtros.tipo) whereEspacios.tipo_inmobiliario = filtros.tipo;
    if (filtros.edificacion) whereEspacios.nombre_edificacion = filtros.edificacion;

    const whereRecursos: any = {};
    if (filtros.edificacion) whereRecursos.nombre_edificacion = filtros.edificacion;

    const [
      totalEdificaciones,
      totalEspacios,
      espaciosPorEstado,
      recursosPorEstado,
    ] = await Promise.all([
      this.prisma.edificacion.count(),
      this.prisma.espacio_fisico.count({ where: whereEspacios }),
      this.prisma.espacio_fisico.groupBy({
        by: ['tipo_inmobiliario'],
        where: whereEspacios,
        _count: { _all: true },
      }),
      this.prisma.recurso_tecnologicos.groupBy({
        by: ['estado_mantenimiento'],
        where: whereRecursos,
        _count: { _all: true },
      }),
    ]);

    return {
      totalEdificaciones,
      totalEspacios,
      espaciosPorEstado: espaciosPorEstado.map((r) => ({
        estado: r.tipo_inmobiliario,
        total: r._count._all,
      })),
      recursosTecnologicos: recursosPorEstado.map((r) => ({
        estado: r.estado_mantenimiento,
        total: r._count._all,
      })),
    };
  }

  /* ══════════════════════════════════════════════════════════
   * BLOQUE 4 — Finanzas
   * ══════════════════════════════════════════════════════════ */
  async getReporteFinanzas(
    filtros: { estado?: string; desde?: string; hasta?: string; moneda?: string } = {},
  ) {
    const whereFolio: any = {};
    if (filtros.estado) whereFolio.estado = filtros.estado;
    if (filtros.desde || filtros.hasta) {
      whereFolio.fecha_inicio_mes = {};
      if (filtros.desde) whereFolio.fecha_inicio_mes.gte = new Date(filtros.desde);
      if (filtros.hasta) whereFolio.fecha_inicio_mes.lte = new Date(filtros.hasta);
    }

    const whereTasas: any = {};
    if (filtros.moneda) {
      const [origen, destino] = filtros.moneda.split('/');
      if (origen) whereTasas.moneda_origen = origen;
      if (destino) whereTasas.moneda_destino = destino;
    }
    if (filtros.desde || filtros.hasta) {
      whereTasas.fecha_vigencia = {};
      if (filtros.desde) whereTasas.fecha_vigencia.gte = new Date(filtros.desde);
      if (filtros.hasta) whereTasas.fecha_vigencia.lte = new Date(`${filtros.hasta}T23:59:59`);
    }

    const [
      facturas,
      saldosBilleteras,
      tasasCambio,
    ] = await Promise.all([
      this.prisma.folio.groupBy({
        by: ['estado'],
        where: whereFolio,
        _count: { _all: true },
      }),
      this.prisma.billetera_digital.aggregate({
        _sum: { saldo: true },
        _avg: { saldo: true },
        _count: { _all: true },
      }),
      this.prisma.tasa_cambio.findMany({
        where: whereTasas,
        orderBy: { fecha_vigencia: 'desc' },
        take: 5,
        select: {
          moneda_origen: true,
          moneda_destino: true,
          valor_tasa: true,
          fecha_vigencia: true,
        },
      }),
    ]);

    return {
      foliosPorEstado: facturas.map((r) => ({
        estado: r.estado,
        total: r._count._all,
      })),
      billeteras: {
        totalBilleteras: saldosBilleteras._count._all,
        saldoTotal: Number(saldosBilleteras._sum.saldo ?? 0),
        saldoPromedio: Number(saldosBilleteras._avg.saldo ?? 0),
      },
      tasasCambioRecientes: tasasCambio.map((t) => ({
        par: `${t.moneda_origen}/${t.moneda_destino}`,
        tasa: Number(t.valor_tasa),
        fecha: t.fecha_vigencia,
      })),
    };
  }

  /* ══════════════════════════════════════════════════════════
   * BLOQUE 5 — Ofertas Laborales
   * ══════════════════════════════════════════════════════════ */
  async getReporteOfertasLaborales(filtros: { estatus?: string; entidad?: string } = {}) {
    const whereOfertaLaboral: any = {};
    if (filtros.estatus) whereOfertaLaboral.estatus_vacante = filtros.estatus;
    if (filtros.entidad) whereOfertaLaboral.nombre_entidad = filtros.entidad;

    const wherePostulaciones: any = {};
    if (filtros.entidad) wherePostulaciones.nombre_entidad = filtros.entidad;
    if (filtros.estatus) wherePostulaciones.oferta_laboral = { estatus_vacante: filtros.estatus };

    const [
      totalOfertas,
      ofertasPorEstatus,
      postulacionesPorOferta,
    ] = await Promise.all([
      this.prisma.oferta_laboral.count({ where: whereOfertaLaboral }),
      this.prisma.oferta_laboral.groupBy({
        by: ['estatus_vacante'],
        where: filtros.entidad ? { nombre_entidad: filtros.entidad } : {},
        _count: { _all: true },
      }),
      this.prisma.oferta.groupBy({
        by: ['nombre_entidad', 'cargo'],
        where: wherePostulaciones,
        _count: { _all: true },
        orderBy: { _count: { id_miembro: 'desc' } },
        take: 10,
      }),
    ]);

    return {
      totalOfertas,
      ofertasPorEstatus: ofertasPorEstatus.map((r) => ({
        estatus: r.estatus_vacante,
        total: r._count._all,
      })),
      topOfertasMasPostuladas: postulacionesPorOferta.map((r) => ({
        entidad: r.nombre_entidad,
        cargo: r.cargo,
        totalPostulaciones: r._count._all,
      })),
    };
  }

  /* ══════════════════════════════════════════════════════════
   * BLOQUE 5.1 — Opciones para los selects de filtro
   *  (valores reales presentes en la BD, no hardcodeados)
   * ══════════════════════════════════════════════════════════ */
  async getOpcionesFiltro() {
    const [
      estadosSolicitud,
      estadosFolio,
      tiposEspacio,
      edificaciones,
      estatusOferta,
      entidades,
      pares,
    ] = await Promise.all([
      this.prisma.solicitud_servicio.findMany({
        distinct: ['estado'],
        select: { estado: true },
        orderBy: { estado: 'asc' },
      }),
      this.prisma.folio.findMany({
        distinct: ['estado'],
        select: { estado: true },
        orderBy: { estado: 'asc' },
      }),
      this.prisma.espacio_fisico.findMany({
        distinct: ['tipo_inmobiliario'],
        select: { tipo_inmobiliario: true },
        orderBy: { tipo_inmobiliario: 'asc' },
      }),
      this.prisma.edificacion.findMany({
        distinct: ['nombre_edificacion'],
        select: { nombre_edificacion: true },
        orderBy: { nombre_edificacion: 'asc' },
      }),
      this.prisma.oferta_laboral.findMany({
        distinct: ['estatus_vacante'],
        select: { estatus_vacante: true },
        orderBy: { estatus_vacante: 'asc' },
      }),
      this.prisma.organizacion_externa.findMany({
        select: { nombre_entidad: true },
        orderBy: { nombre_entidad: 'asc' },
      }),
      this.prisma.tasa_cambio.findMany({
        distinct: ['moneda_origen', 'moneda_destino'],
        select: { moneda_origen: true, moneda_destino: true },
      }),
    ]);

    return {
      estadosSolicitud: estadosSolicitud.map((e) => e.estado),
      estadosFolio: estadosFolio.map((e) => e.estado),
      tiposEspacio: tiposEspacio.map((e) => e.tipo_inmobiliario),
      edificaciones: edificaciones.map((e) => e.nombre_edificacion),
      estatusOferta: estatusOferta.map((e) => e.estatus_vacante),
      entidades: entidades.map((e) => e.nombre_entidad),
      paresMonedas: [...new Set(pares.map((p) => `${p.moneda_origen}/${p.moneda_destino}`))],
    };
  }

  /* ══════════════════════════════════════════════════════════
   * BLOQUE 6 — Resumen completo para dashboard IA
   *  (endpoint único que agrega todo para IA / token)
   * ══════════════════════════════════════════════════════════ */
  async getResumenCompleto() {
    const [kpis, servicios, infraestructura, finanzas, ofertas] =
      await Promise.all([
        this.getKpisGenerales(),
        this.getReporteServicios(),
        this.getReporteInfraestructura(),
        this.getReporteFinanzas(),
        this.getReporteOfertasLaborales(),
      ]);

    return {
      generadoEn: new Date().toISOString(),
      kpisGenerales: kpis,
      servicios,
      infraestructura,
      finanzas,
      ofertasLaborales: ofertas,
      // Cuellos de botella detectables con datos actuales:
      alertas: this._detectarCuellosDeBottella({ kpis, servicios, infraestructura }),
    };
  }

  /* ── Detección automática de cuellos de botella ─────────── */
  private _detectarCuellosDeBottella(data: any): string[] {
    const alertas: string[] = [];

    // Miembros suspendidos / bloqueados
    const suspendidos = data.kpis.miembrosPorEstado.find(
      (e: any) => e.estado === 'suspendida',
    );
    if (suspendidos?.total > 10) {
      alertas.push(
        `⚠️ Alta cantidad de miembros suspendidos: ${suspendidos.total}`,
      );
    }

    // Solicitudes pendientes sin resolver
    const pendientes = data.servicios.solicitudesPorEstado.find(
      (e: any) => e.estado === 'pendiente',
    );
    if (pendientes?.total > 20) {
      alertas.push(
        `⚠️ Cuello de botella en solicitudes pendientes: ${pendientes.total} sin resolver`,
      );
    }

    // Espacios fuera de servicio
    const espaciosBloqueados = data.infraestructura.espaciosPorEstado.find(
      (e: any) => e.estado === 'no_disponible' || e.estado === 'mantenimiento',
    );
    if (espaciosBloqueados?.total > 5) {
      alertas.push(
        `⚠️ ${espaciosBloqueados.total} espacios físicos fuera de servicio`,
      );
    }

    // Recursos en mantenimiento
    const recursosEnMant = data.infraestructura.recursosTecnologicos.find(
      (e: any) => e.estado === 'mantenimiento',
    );
    if (recursosEnMant?.total > 3) {
      alertas.push(
        `⚠️ ${recursosEnMant.total} recursos tecnológicos en mantenimiento`,
      );
    }

    if (alertas.length === 0) {
      alertas.push('✅ No se detectaron cuellos de botella críticos.');
    }

    return alertas;
  }
}
