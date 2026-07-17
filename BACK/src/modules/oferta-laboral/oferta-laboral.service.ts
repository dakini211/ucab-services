import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOfertaDto } from './dto/create-oferta.dto';
import {
  armarPagina,
  resolverOrden,
  resolverPaginado,
} from '../../common/utils/pagination.util';

/**
 * Bolsa de trabajo (pág. 4 del enunciado).
 *
 * Dos cosas distintas conviven aquí a propósito:
 *   - Oferta_laboral : la vacante que publica la organización externa
 *   - Oferta         : la postulación del miembro a esa vacante
 * Son tablas separadas, pero un solo dominio de negocio y una sola pantalla,
 * así que se atienden desde el mismo módulo.
 */
@Injectable()
export class OfertaLaboralService {
  constructor(private prisma: PrismaService) {}

  /**
   * Columnas ordenables. Clave = nombre público; valor = expresión SQL real.
   *
   * SEGURIDAD: ORDER BY no acepta parámetros en PostgreSQL, así que la columna
   * se interpola como texto. Sin esta lista blanca, ?sortBy= sería inyección
   * SQL directa. Ver la nota en pagination.util.ts.
   */
  private static readonly ORDENABLES: Record<string, string> = {
    cargo: 'ol.cargo',
    nombre_entidad: 'ol.nombre_entidad',
    razon_social: 'oe.razon_social',
    fecha_oferta: 'ol.fecha_oferta',
    estatus_vacante: 'ol.estatus_vacante',
    cantidad_postulantes: '(SELECT COUNT(*) FROM Oferta o WHERE o.nombre_entidad = ol.nombre_entidad AND o.cargo = ol.cargo)',
  };

  /**
   * Listado paginado de vacantes.
   *
   * Devuelve el formato PLANO { data, total, page, limit, totalPages }, igual
   * que ServicioService y MiembroService. El front ya consume ese contrato.
   */
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
      OfertaLaboralService.ORDENABLES,
      'fecha_oferta',
      params.sortBy,
      params.order,
    );

    const search = (params.search ?? '').trim();

    // 'todos' es el valor del <select> cuando no hay filtro: se normaliza a ''
    // para no terminar buscando literalmente estatus_vacante = 'todos'.
    const estatusRaw = (params.estatus ?? '').trim();
    const estatus = estatusRaw === 'todos' ? '' : estatusRaw;

    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        ol.nombre_entidad,
        ol.cargo,
        ol.responsabilidades,
        ol.beneficios,
        ol.perfil_buscado,
        ol.fecha_oferta,
        ol.estatus_vacante,
        oe.razon_social,
        oe.rif,
        (SELECT COUNT(*)::int FROM Oferta o
          WHERE o.nombre_entidad = ol.nombre_entidad
            AND o.cargo = ol.cargo) AS cantidad_postulantes,
        COUNT(*) OVER()::int AS total_registros
      FROM Oferta_laboral ol
      JOIN Organizacion_externa oe ON oe.nombre_entidad = ol.nombre_entidad
      WHERE (
              ${search} = ''
              OR ol.cargo          ILIKE '%' || ${search} || '%'
              OR ol.perfil_buscado ILIKE '%' || ${search} || '%'
              OR oe.razon_social   ILIKE '%' || ${search} || '%'
              OR ol.nombre_entidad ILIKE '%' || ${search} || '%'
            )
        AND (${estatus} = '' OR ol.estatus_vacante = ${estatus})
      ORDER BY ${sortSql} ${orderSql}
      LIMIT ${limit} OFFSET ${offset}
    `;

    return armarPagina(rows, page, limit);
  }

  /** Detalle de una vacante. La PK es la clave natural (nombre_entidad, cargo). */
  async findOne(nombre_entidad: string, cargo: string) {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        ol.nombre_entidad,
        ol.cargo,
        ol.responsabilidades,
        ol.beneficios,
        ol.perfil_buscado,
        ol.fecha_oferta,
        ol.estatus_vacante,
        oe.razon_social,
        oe.rif,
        (SELECT COUNT(*)::int FROM Oferta o
          WHERE o.nombre_entidad = ol.nombre_entidad
            AND o.cargo = ol.cargo) AS cantidad_postulantes
      FROM Oferta_laboral ol
      JOIN Organizacion_externa oe ON oe.nombre_entidad = ol.nombre_entidad
      WHERE ol.nombre_entidad = ${nombre_entidad}
        AND ol.cargo = ${cargo}
    `;

    if (rows.length === 0) {
      throw new NotFoundException(`No existe la oferta "${cargo}" de ${nombre_entidad}.`);
    }
    return rows[0];
  }

  /**
   * Estadísticas del módulo.
   *
   * Los nombres coinciden con la interfaz OfertasStats del front. La versión
   * anterior devolvía { total, activas } y además contaba
   * `estatus_vacante = 'Activa'`, valor que no existe: el CHECK del esquema
   * solo admite 'disponible' y 'finalizada'. El contador daba 0 siempre.
   */
  async getStats() {
    const rows = await this.prisma.$queryRaw<any[]>`
      SELECT
        (SELECT COUNT(*)::int FROM Oferta_laboral)                                AS total_ofertas,
        (SELECT COUNT(*)::int FROM Oferta_laboral
          WHERE estatus_vacante = 'disponible')                                   AS ofertas_disponibles,
        (SELECT COUNT(DISTINCT (nombre_entidad, cargo))::int FROM Oferta)         AS ofertas_con_postulantes,
        (SELECT COUNT(*)::int FROM Oferta)                                        AS total_postulaciones
    `;
    return rows[0];
  }

  /**
   * Postula al miembro autenticado.
   *
   * Toda la regla de negocio (mayoría de edad, cuenta activa, vacante
   * disponible, no duplicar) vive en sp_aplicar_oferta_laboral. Aquí solo se
   * valida QUIÉN puede llamarlo. Si el procedimiento lanza RAISE EXCEPTION,
   * el PrismaExceptionFilter lo traduce a un 400 con el mensaje legible.
   */
  async aplicar(user: any, dto: CreateOfertaDto) {
    if (user.rol !== 'Estudiante') {
      throw new ForbiddenException('Solo los estudiantes pueden postularse a ofertas laborales.');
    }

    await this.prisma.$executeRaw`
      CALL sp_aplicar_oferta_laboral(
        ${BigInt(user.id)},
        ${dto.nombre_entidad},
        ${dto.cargo}
      )
    `;

    return { ok: true, mensaje: 'Postulación enviada. Tu solicitud quedó en revisión.' };
  }

  /** Postulaciones del miembro autenticado (marca "Ya postulado" en el listado). */
  async misPostulaciones(user: any) {
    return this.prisma.$queryRaw<any[]>`
      SELECT
        o.nombre_entidad,
        o.cargo,
        ol.estatus_vacante,
        oe.razon_social
      FROM Oferta o
      JOIN Oferta_laboral ol ON ol.nombre_entidad = o.nombre_entidad AND ol.cargo = o.cargo
      JOIN Organizacion_externa oe ON oe.nombre_entidad = ol.nombre_entidad
      WHERE o.id_miembro = ${BigInt(user.id)}
      ORDER BY ol.fecha_oferta DESC
    `;
  }

  /** Vacantes sugeridas por perfil (emparejamiento de la pág. 4). */
  async sugeridas(user: any) {
    return this.prisma.$queryRaw<any[]>`
      SELECT * FROM fn_ofertas_sugeridas(${BigInt(user.id)})
    `;
  }
}
