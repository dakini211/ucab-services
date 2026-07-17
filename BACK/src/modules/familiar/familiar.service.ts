import { Injectable, InternalServerErrorException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFamiliarDto } from './dto/create-familiar.dto';

@Injectable()
export class FamiliarService {
  constructor(private prisma: PrismaService) {}

  async registrarFamiliar(idMiembro: number | string, dto: CreateFamiliarDto) {
    try {
      await this.prisma.$executeRaw`
        SELECT registrar_familiar_personal_ucab(
          ${BigInt(idMiembro)}, 
          ${dto.cedula}, 
          ${dto.nombre_familiar}, 
          ${dto.parentesco}, 
          ${dto.edad_familiar},
          ${dto.estudios ?? null},
          ${dto.vacunacion ?? null},
          ${dto.educacion_inicial ?? null}
        );
      `;
      return { ok: true, mensaje: 'Familiar registrado exitosamente' };
    } catch (error) {
      if (error.message && error.message.includes('Error:')) {
        throw new BadRequestException(error.message);
      }
      throw error;
    }
  }

  async getMisFamiliares(idMiembro: number) {
    const familiares = await this.prisma.familiar.findMany({
      where: { id_personal_ucab: BigInt(idMiembro) },
      include: {
        cargo_mayor: true,
        cargo_menor: true,
      },
      orderBy: { nombre_familiar: 'asc' },
    });

    return familiares.map(f => ({
      cedula: f.cedula,
      nombre_familiar: f.nombre_familiar,
      parentesco: f.parentesco,
      edad_familiar: f.edad_familiar,
      fecha_de_inicio: f.fecha_de_inicio,
      tipo: f.edad_familiar > 18 ? 'Mayor' : 'Menor',
      cargo_mayor: f.cargo_mayor ? { estudios: f.cargo_mayor.estudios } : null,
      cargo_menor: f.cargo_menor
        ? {
            vacunacion: f.cargo_menor.vacunacion,
            educacion_inicial: f.cargo_menor.educacion_inicial,
          }
        : null,
    }));
  }
}
