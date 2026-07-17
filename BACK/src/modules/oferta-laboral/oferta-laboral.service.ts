import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

function armarPagina(rows: any[], page: number, limit: number) {
  const total = rows.length ? Number(rows[0].total_registros) : 0;
  return {
    data: rows.map(({ total_registros, ...r }) => r),
    total,
    page,
    limit,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
}

@Injectable()
export class OfertaLaboralService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { search?: string; estatus?: string; page?: number; limit?: number }) {
    const page = params.page && params.page > 0 ? params.page : 1;
    const limit = params.limit && params.limit > 0 ? params.limit : 10;
    const offset = (page - 1) * limit;
    const search = (params.search ?? '').trim();
    const estatus = (params.estatus ?? '').trim();

    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        md5(ol.nombre_entidad || ol.cargo) AS id_oferta_laboral,
        ol.nombre_entidad,
        ol.cargo,
        ol.responsabilidades,
        ol.beneficios,
        ol.perfil_buscado,
        ol.fecha_oferta,
        ol.estatus_vacante,
        oe.razon_social,
        oe.rif,
        (SELECT COUNT(*) FROM Oferta o WHERE o.nombre_entidad = ol.nombre_entidad AND o.cargo = ol.cargo)::int AS cantidad_postulantes,
        COUNT(*) OVER()::int AS total_registros
      FROM Oferta_laboral ol
      JOIN Organizacion_externa oe ON oe.nombre_entidad = ol.nombre_entidad
      WHERE (
              ${search} = ''
              OR ol.cargo           ILIKE '%' || ${search} || '%'
              OR ol.nombre_entidad  ILIKE '%' || ${search} || '%'
              OR oe.razon_social    ILIKE '%' || ${search} || '%'
            )
        AND (${estatus} = '' OR ol.estatus_vacante = ${estatus})
      ORDER BY ol.fecha_oferta DESC
      LIMIT ${limit} OFFSET ${offset}
    `;

    return armarPagina(rows, page, limit);
  }

  async findOne(nombre_entidad: string, cargo: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        md5(ol.nombre_entidad || ol.cargo) AS id_oferta_laboral,
        ol.nombre_entidad,
        ol.cargo,
        ol.responsabilidades,
        ol.beneficios,
        ol.perfil_buscado,
        ol.fecha_oferta,
        ol.estatus_vacante,
        oe.razon_social,
        oe.rif,
        (SELECT COUNT(*) FROM Oferta o WHERE o.nombre_entidad = ol.nombre_entidad AND o.cargo = ol.cargo)::int AS cantidad_postulantes
      FROM Oferta_laboral ol
      JOIN Organizacion_externa oe ON oe.nombre_entidad = ol.nombre_entidad
      WHERE ol.nombre_entidad = ${nombre_entidad} AND ol.cargo = ${cargo}
    `;
    return rows[0] ?? null;
  }

  /** Para admin_general: ofertas totales y cuántas tienen miembros postulados. */
  async getStats() {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        (SELECT COUNT(*) FROM Oferta_laboral)::int                          AS total_ofertas,
        (SELECT COUNT(*) FROM Oferta_laboral WHERE estatus_vacante = 'disponible')::int AS ofertas_disponibles,
        (SELECT COUNT(DISTINCT (nombre_entidad, cargo)) FROM Oferta)::int         AS ofertas_con_postulantes,
        (SELECT COUNT(*) FROM Oferta)::int                                   AS total_postulaciones
    `;
    return rows[0];
  }
}
