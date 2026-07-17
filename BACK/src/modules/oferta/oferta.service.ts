import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOfertaDto } from './dto/create-oferta.dto';

@Injectable()
export class OfertaService {
  constructor(private prisma: PrismaService) {}

  /**
   * Postula al miembro autenticado a una oferta laboral.
   * Toda la regla de negocio (edad mínima, no duplicar postulación) vive en
   * sp_aplicar_oferta_laboral; aquí solo se valida quién puede llamarlo.
   */
  async aplicar(user: any, dto: CreateOfertaDto) {
    if (user.rol !== 'Estudiante') {
      throw new ForbiddenException('Solo los estudiantes pueden postularse a ofertas laborales.');
    }

    await this.prisma.$executeRaw`
      INSERT INTO Oferta (nombre_entidad, cargo, id_miembro)
      VALUES (${dto.nombre_entidad}, ${dto.cargo}, ${BigInt(user.id)})
      ON CONFLICT DO NOTHING
    `;

    return { ok: true, mensaje: 'Postulación enviada. Tu solicitud quedó en revisión.' };
  }

  /** Postulaciones del estudiante autenticado (para marcar "Ya postulado" en el listado). */
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
}
