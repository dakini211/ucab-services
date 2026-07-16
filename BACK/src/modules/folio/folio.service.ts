import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import {
  armarPagina,
  resolverOrden,
  resolverPaginado,
} from '../../common/utils/pagination.util';

/**
 * Folio = estado de cuenta (regla pag. 4 del enunciado).
 *
 * PRINCIPIO DE DISEÑO: este servicio NO reimplementa ninguna regla de negocio.
 * No calcula totales, no decide estados. Solo invoca los procedimientos de
 * PL/pgSQL. Si alguien inserta datos por fuera de la app, los triggers siguen
 * actuando igual. La logica vive en el gestor, que es lo que exige la entrega.
 *
 * NOTA SOBRE LA PK: folio tiene clave primaria de 4 columnas
 * (id_miembro, id_servicio, fecha_de_creacion, nro_de_folio), heredada de
 * solicitud_servicio. Por eso NO existe un findOne(id): la clave viaja como
 * query params. El stub que dejo generate-crud.js usaba
 * `where: { id_miembro: BigInt(id) }`, que era incorrecto.
 */

export interface FolioKey {
  id_miembro: string | number | bigint;
  id_servicio: number;
  fecha_de_creacion: string | Date;
  nro_de_folio: string;
}

@Injectable()
export class FolioService {
  constructor(private prisma: PrismaService) { }

  /** Columnas ordenables. Ver nota de seguridad en pagination.util.ts */
  private static readonly ORDENABLES: Record<string, string> = {
    nro_de_folio: 'fo.nro_de_folio',
    estado: 'fo.estado',
    fecha_inicio_mes: 'fo.fecha_inicio_mes',
    fecha_fin_mes: 'fo.fecha_fin_mes',
    miembro: 'm.primer_apellido',
    nombre_servicio: 's.nombre_servicio',
    total:
      'fn_total_folio(fo.id_miembro, fo.id_servicio, fo.fecha_de_creacion, fo.nro_de_folio)',
  };

  async findAll(user: any, params: {
    search?: string;
    estado?: string;
    page?: number;
    limit?: number;
    sortBy?: string;
    order?: string;
  }) {
    const { page, limit, offset } = resolverPaginado(params.page, params.limit);
    const { sortSql, orderSql } = resolverOrden(
      FolioService.ORDENABLES,
      'fecha_inicio_mes',
      params.sortBy,
      params.order,
    );

    const search = (params.search ?? '').trim();
    let estado = (params.estado ?? '').trim();
    if (estado === 'todos') estado = '';

    console.log('[FOLIO findAll] user:', JSON.stringify(user), 'estado:', estado, 'search:', search);

    // Los montos se castean a ::float8 para que lleguen al front como number.
    // Sin el cast, Prisma devuelve Decimal y se serializa como string.
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        fo.id_miembro,
        fo.id_servicio,
        fo.fecha_de_creacion,
        fo.nro_de_folio,
        fo.estado,
        fo.fecha_inicio_mes,
        fo.fecha_fin_mes,
        m.primer_nombre || ' ' || m.primer_apellido AS miembro,
        m.cedula_identidad,
        s.nombre_servicio,
        fn_total_folio(fo.id_miembro, fo.id_servicio, fo.fecha_de_creacion, fo.nro_de_folio)::float8 AS total,
        (SELECT COUNT(*) FROM Items_Consumo ic
          WHERE ic.id_miembro = fo.id_miembro
            AND ic.id_servicio = fo.id_servicio
            AND ic.fecha_de_creacion = fo.fecha_de_creacion
            AND ic.nro_de_folio = fo.nro_de_folio)::int AS cantidad_items,
        fa.numero_de_control,
        COUNT(*) OVER()::int AS total_registros
      FROM Folio fo
      JOIN Miembro  m ON m.id_miembro  = fo.id_miembro
      JOIN Servicio s ON s.id_servicio = fo.id_servicio
      LEFT JOIN Factura fa
             ON fa.id_miembro        = fo.id_miembro
            AND fa.id_servicio       = fo.id_servicio
            AND fa.fecha_de_creacion = fo.fecha_de_creacion
            AND fa.nro_de_folio      = fo.nro_de_folio
      WHERE (
              ${search} = ''
              OR fo.nro_de_folio          ILIKE '%' || ${search} || '%'
              OR m.primer_nombre          ILIKE '%' || ${search} || '%'
              OR m.primer_apellido        ILIKE '%' || ${search} || '%'
              OR m.cedula_identidad::TEXT ILIKE '%' || ${search} || '%'
              OR s.nombre_servicio        ILIKE '%' || ${search} || '%'
            )
        AND (${estado} = '' OR fo.estado::text = ${estado})
        ${(user.rol !== 'Admin' && user.rol !== 'Administrativo') ? Prisma.sql`AND fo.id_miembro = ${BigInt(user.id)}` : Prisma.empty}
      ORDER BY ${sortSql} ${orderSql}
      LIMIT ${limit} OFFSET ${offset}
    `;

    console.log('[FOLIO findAll] rows count:', rows.length);
    return armarPagina(rows, page, limit);
  }

  /** Cifras de cabecera del modulo financiero. */
  async getStats(user: any) {
    if (user.rol !== 'Admin' && user.rol !== 'Administrativo') {
      throw new ForbiddenException('Solo los administradores pueden ver estas estadísticas.');
    }
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        (SELECT COUNT(*) FROM Folio   WHERE estado  = 'abierto')::int   AS folios_abiertos,
        (SELECT COUNT(*) FROM Factura WHERE estatus = 'pendiente')::int AS facturas_pendientes,
        (SELECT COUNT(*) FROM Factura WHERE estatus = 'parcial')::int   AS facturas_parciales,
        (SELECT COUNT(*) FROM Factura WHERE estatus = 'pagada')::int    AS facturas_pagadas,
        (SELECT COALESCE(SUM(saldo), 0) FROM Factura
          WHERE estatus IN ('pendiente', 'parcial'))::float8            AS por_cobrar
    `;
    return rows[0];
  }

  /** Solicitudes que aun no tienen folio. Alimenta el formulario de apertura. */
  async getSolicitudesSinFolio(user: any) {
    return this.prisma.$queryRaw<any[]>`
      SELECT
        ss.id_miembro, ss.id_servicio, ss.fecha_de_creacion, ss.estado,
        m.primer_nombre || ' ' || m.primer_apellido AS miembro,
        m.cedula_identidad,
        s.nombre_servicio
      FROM Solicitud_servicio ss
      JOIN Miembro  m ON m.id_miembro  = ss.id_miembro
      JOIN Servicio s ON s.id_servicio = ss.id_servicio
      WHERE ss.estado <> 'rechazada'
        AND NOT EXISTS (
          SELECT 1 FROM Folio fo
           WHERE fo.id_miembro = ss.id_miembro
             AND fo.id_servicio = ss.id_servicio
             AND fo.fecha_de_creacion = ss.fecha_de_creacion
         )
        ${(user.rol !== 'Admin' && user.rol !== 'Administrativo') ? Prisma.sql`AND ss.id_miembro = ${user.id}` : Prisma.empty}
      ORDER BY ss.fecha_de_creacion DESC
    `;
  }

  /** Items de un folio, con la tarifa de hoy al lado para evidenciar el congelado. */
  async getItems(user: any, key: FolioKey) {
    if (user.rol !== 'Admin' && user.rol !== 'Administrativo' && Number(key.id_miembro) !== user.id) {
      throw new ForbiddenException('No tiene permiso para ver este folio.');
    }
    const folio = await this.prisma.folio.findUnique({
      where: {
        id_miembro_id_servicio_fecha_de_creacion_nro_de_folio: {
          id_miembro: BigInt(key.id_miembro),
          id_servicio: Number(key.id_servicio),
          fecha_de_creacion: new Date(key.fecha_de_creacion),
          nro_de_folio: key.nro_de_folio,
        },
      },
    });

    if (!folio) {
      throw new NotFoundException(`No existe el folio ${key.nro_de_folio}.`);
    }

    return this.prisma.$queryRaw<any[]>`
      SELECT
        ic.concepto,
        ic.cantidad,
        ic.impuesto_ley::float8    AS impuesto_ley,
        ic.precio_unitario::float8 AS precio_unitario,
        ROUND(ic.cantidad * ic.precio_unitario * (1 + ic.impuesto_ley / 100), 2)::float8 AS total_linea,
        fn_tarifa_vigente(ic.id_servicio, CURRENT_TIMESTAMP)::float8 AS tarifa_hoy
      FROM Items_Consumo ic
      WHERE ic.id_miembro        = ${BigInt(key.id_miembro)}
        AND ic.id_servicio       = ${Number(key.id_servicio)}
        AND ic.fecha_de_creacion = ${new Date(key.fecha_de_creacion)}::timestamp
        AND ic.nro_de_folio      = ${key.nro_de_folio}
      ORDER BY ic.concepto
    `;
  }

  /** Abre un estado de cuenta sobre una solicitud existente. */
  async abrir(user: any, dto: {
    id_miembro: string | number;
    id_servicio: number;
    fecha_de_creacion: string;
    fecha_inicio_mes?: string | null;
    nro_de_folio?: string | null;
  }) {
    if (user.rol !== 'Admin' && user.rol !== 'Administrativo' && Number(dto.id_miembro) !== user.id) {
      throw new ForbiddenException('Solo un administrador puede abrir folios de otros miembros.');
    }
    await this.prisma.$executeRaw`
      CALL sp_abrir_folio(
        p_id_miembro        => ${BigInt(dto.id_miembro)},
        p_id_servicio       => ${Number(dto.id_servicio)},
        p_fecha_de_creacion => ${new Date(dto.fecha_de_creacion)}::timestamp,
        p_fecha_inicio_mes  => ${dto.fecha_inicio_mes ?? null}::date,
        p_nro_de_folio      => ${dto.nro_de_folio ?? null}::varchar
      )
    `;
    return { ok: true, mensaje: 'Folio abierto exitosamente.' };
  }

  /**
   * Convierte un folio en factura (regla pag. 4).
   * uq_factura_folio garantiza que el folio tiene a lo sumo una factura, asi
   * que la consulta posterior siempre devuelve la recien creada.
   */
  async facturar(user: any, key: FolioKey, numero_de_control?: string | null) {
    if (user.rol !== 'Admin' && user.rol !== 'Administrativo' && Number(key.id_miembro) !== user.id) {
      throw new ForbiddenException('No tiene permiso para facturar este folio.');
    }
    await this.prisma.$executeRaw`
      CALL sp_generar_factura(
        p_id_miembro        => ${BigInt(key.id_miembro)},
        p_id_servicio       => ${Number(key.id_servicio)},
        p_fecha_de_creacion => ${new Date(key.fecha_de_creacion)}::timestamp,
        p_nro_de_folio      => ${key.nro_de_folio},
        p_numero_de_control => ${numero_de_control ?? null}::varchar
      )
    `;

    const factura = await this.prisma.factura.findUnique({
      where: {
        id_miembro_id_servicio_fecha_de_creacion_nro_de_folio: {
          id_miembro: BigInt(key.id_miembro),
          id_servicio: Number(key.id_servicio),
          fecha_de_creacion: new Date(key.fecha_de_creacion),
          nro_de_folio: key.nro_de_folio,
        },
      },
    });

    return {
      numero_de_control: factura?.numero_de_control,
      estatus: factura?.estatus,
      saldo: factura ? Number(factura.saldo) : null,
      fecha_de_emision: factura?.fecha_de_emision,
    };
  }

  /** Cierre masivo mensual (regla pag. 7). */
  async cierreMasivo(user: any, mes?: string | null) {
    if (user.rol !== 'Admin' && user.rol !== 'Administrativo') {
      throw new ForbiddenException('Solo un administrador puede realizar el cierre masivo.');
    }
    const antes = await this.contarFoliosAbiertos(mes);

    await this.prisma.$executeRaw`
      CALL sp_cierre_masivo_folios(${mes ?? null}::date)
    `;

    const despues = await this.contarFoliosAbiertos(mes);

    return {
      ok: true,
      facturados: antes - despues,
      omitidos: despues,
      mensaje: `Cierre completado. Facturados: ${antes - despues}. Omitidos: ${despues}.`,
    };
  }

  private async contarFoliosAbiertos(mes?: string | null): Promise<number> {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT COUNT(*)::int AS n
      FROM Folio
      WHERE estado = 'abierto'
        AND fecha_inicio_mes BETWEEN
            DATE_TRUNC('month', COALESCE(${mes ?? null}::date, CURRENT_DATE))::date
        AND (DATE_TRUNC('month', COALESCE(${mes ?? null}::date, CURRENT_DATE))
             + INTERVAL '1 month' - INTERVAL '1 day')::date
    `;
    return Number(rows[0]?.n ?? 0);
  }

  async remove(user: any, key: FolioKey) {
    if (user.rol !== 'Admin' && user.rol !== 'Administrativo') {
      throw new ForbiddenException('Solo un administrador puede eliminar folios.');
    }
    const res = await this.prisma.$executeRaw`
      DELETE FROM Folio
      WHERE id_miembro = ${BigInt(key.id_miembro)}
        AND id_servicio = ${Number(key.id_servicio)}
        AND fecha_de_creacion = ${new Date(key.fecha_de_creacion)}::timestamp
        AND nro_de_folio = ${key.nro_de_folio}
    `;
    if (res === 0) {
      throw new NotFoundException('No se encontró el folio.');
    }
    return { message: 'Folio eliminado con éxito.' };
  }
}
