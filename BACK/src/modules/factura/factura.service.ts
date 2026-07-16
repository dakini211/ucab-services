import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import {
  armarPagina,
  resolverOrden,
  resolverPaginado,
} from '../../common/utils/pagination.util';

/**
 * Factura: documento fiscal que consolida los cargos de un folio (pag. 4).
 *
 * NOTA SOBRE LA PK: factura tiene PK simple (numero_de_control), NO id_miembro.
 * El stub de generate-crud.js usaba `where: { id_miembro: BigInt(id) }`, que
 * apuntaba a una columna que ni siquiera es clave. Aqui queda corregido.
 */
@Injectable()
export class FacturaService {
  constructor(private prisma: PrismaService) {}

  private static readonly ORDENABLES: Record<string, string> = {
    numero_de_control: 'f.numero_de_control',
    fecha_de_emision: 'f.fecha_de_emision',
    estatus: 'f.estatus',
    saldo: 'f.saldo',
    miembro: 'm.primer_apellido',
    nombre_servicio: 's.nombre_servicio',
    nro_de_folio: 'f.nro_de_folio',
  };

  async findAll(params: {
    search?: string;
    estatus?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: string;
  }) {
    const { page, limit, offset } = resolverPaginado(params.page, params.limit);
    const { sortSql, orderSql } = resolverOrden(
      FacturaService.ORDENABLES,
      'fecha_de_emision',
      params.sortBy,
      params.order,
    );

    const search = (params.search ?? '').trim();
    const estatus = (params.estatus ?? '').trim();

    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        f.numero_de_control,
        f.fecha_de_emision,
        f.estatus,
        f.saldo::float8 AS saldo,
        f.id_miembro,
        f.id_servicio,
        f.fecha_de_creacion,
        f.nro_de_folio,
        m.primer_nombre || ' ' || m.primer_apellido AS miembro,
        m.cedula_identidad,
        s.nombre_servicio,
        fn_total_folio(f.id_miembro, f.id_servicio, f.fecha_de_creacion, f.nro_de_folio)::float8 AS total,
        fn_total_pagado(f.numero_de_control)::float8 AS pagado,
        COUNT(*) OVER()::int AS total_registros
      FROM Factura f
      JOIN Miembro  m ON m.id_miembro  = f.id_miembro
      JOIN Servicio s ON s.id_servicio = f.id_servicio
      WHERE (
              ${search} = ''
              OR f.numero_de_control      ILIKE '%' || ${search} || '%'
              OR f.nro_de_folio           ILIKE '%' || ${search} || '%'
              OR m.primer_nombre          ILIKE '%' || ${search} || '%'
              OR m.primer_apellido        ILIKE '%' || ${search} || '%'
              OR m.cedula_identidad::TEXT ILIKE '%' || ${search} || '%'
              OR s.nombre_servicio        ILIKE '%' || ${search} || '%'
            )
        AND (${estatus} = '' OR f.estatus = ${estatus})
      ORDER BY ${sortSql} ${orderSql}
      LIMIT ${limit} OFFSET ${offset}
    `;

    return armarPagina(rows, page, limit);
  }

  /** Factura + sus items de consumo + sus abonos. */
  async findOne(numero_de_control: string) {
    const facturas = await this.prisma.$queryRaw<any[]>`
      SELECT
        f.numero_de_control,
        f.fecha_de_emision,
        f.estatus,
        f.saldo::float8 AS saldo,
        f.id_miembro,
        f.id_servicio,
        f.fecha_de_creacion,
        f.nro_de_folio,
        m.primer_nombre || ' ' || m.primer_apellido AS miembro,
        m.cedula_identidad,
        m.correo_institucional,
        s.nombre_servicio,
        fn_total_folio(f.id_miembro, f.id_servicio, f.fecha_de_creacion, f.nro_de_folio)::float8 AS total,
        fn_total_pagado(f.numero_de_control)::float8  AS pagado,
        fn_saldo_factura(f.numero_de_control)::float8 AS saldo_recalculado
      FROM Factura f
      JOIN Miembro  m ON m.id_miembro  = f.id_miembro
      JOIN Servicio s ON s.id_servicio = f.id_servicio
      WHERE f.numero_de_control = ${numero_de_control}
    `;

    if (facturas.length === 0) {
      throw new NotFoundException(`No existe la factura ${numero_de_control}.`);
    }
    const factura = facturas[0];

    const items = await this.prisma.$queryRaw<any[]>`
      SELECT
        ic.concepto,
        ic.cantidad,
        ic.impuesto_ley::float8    AS impuesto_ley,
        ic.precio_unitario::float8 AS precio_unitario,
        ROUND(ic.cantidad * ic.precio_unitario, 2)::float8 AS subtotal,
        ROUND(ic.cantidad * ic.precio_unitario * (ic.impuesto_ley / 100), 2)::float8 AS impuesto,
        ROUND(ic.cantidad * ic.precio_unitario * (1 + ic.impuesto_ley / 100), 2)::float8 AS total_linea
      FROM Items_Consumo ic
      WHERE ic.id_miembro        = ${factura.id_miembro}
        AND ic.id_servicio       = ${factura.id_servicio}
        AND ic.fecha_de_creacion = ${factura.fecha_de_creacion}
        AND ic.nro_de_folio      = ${factura.nro_de_folio}
      ORDER BY ic.concepto
    `;

    // La jerarquia de metodos de pago es DISJUNTA: un abono vive en UNA sola
    // subclase. Los LEFT JOIN reconstruyen el tipo real y su referencia de
    // auditoria sin necesidad de una columna discriminadora en el padre.
    const pagos = await this.prisma.$queryRaw<any[]>`
      SELECT
        mp.fecha_operacion,
        mp.monto::float8 AS monto,
        CASE
          WHEN z.numero_de_control   IS NOT NULL THEN 'Zelle'
          WHEN t.numero_de_control   IS NOT NULL THEN 'Tarjeta'
          WHEN pm.numero_de_control  IS NOT NULL THEN 'Pago Movil'
          WHEN e.numero_de_control   IS NOT NULL THEN 'Efectivo'
          WHEN c.numero_de_control   IS NOT NULL THEN 'Criptomoneda'
          WHEN tai.numero_de_control IS NOT NULL THEN 'TAI'
          ELSE 'Sin clasificar'
        END AS tipo,
        COALESCE(z.confirmacion, pm.referencia, c.dxid, t.nro_tarjeta, tai.uid) AS referencia
      FROM Metodo_Pago mp
      LEFT JOIN Zelle        z   ON z.numero_de_control   = mp.numero_de_control AND z.fecha_operacion   = mp.fecha_operacion
      LEFT JOIN Tarjeta      t   ON t.numero_de_control   = mp.numero_de_control AND t.fecha_operacion   = mp.fecha_operacion
      LEFT JOIN Pago_Movil   pm  ON pm.numero_de_control  = mp.numero_de_control AND pm.fecha_operacion  = mp.fecha_operacion
      LEFT JOIN Efectivo     e   ON e.numero_de_control   = mp.numero_de_control AND e.fecha_operacion   = mp.fecha_operacion
      LEFT JOIN Criptomoneda c   ON c.numero_de_control   = mp.numero_de_control AND c.fecha_operacion   = mp.fecha_operacion
      LEFT JOIN TAI          tai ON tai.numero_de_control = mp.numero_de_control AND tai.fecha_operacion = mp.fecha_operacion
      WHERE mp.numero_de_control = ${numero_de_control}
      ORDER BY mp.fecha_operacion
    `;

    return { factura, items, pagos };
  }

  async getStats() {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        COUNT(*)::int AS total_facturas,
        COUNT(*) FILTER (WHERE estatus = 'pendiente')::int AS pendientes,
        COUNT(*) FILTER (WHERE estatus = 'parcial')::int   AS parciales,
        COUNT(*) FILTER (WHERE estatus = 'pagada')::int    AS pagadas,
        COALESCE(SUM(saldo), 0)::float8 AS por_cobrar
      FROM Factura
    `;
    return rows[0];
  }
}
