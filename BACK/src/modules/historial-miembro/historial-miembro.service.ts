import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHistorialMiembroDto } from './dto/create-historial-miembro.dto';
import { UpdateHistorialMiembroDto } from './dto/update-historial-miembro.dto';

@Injectable()
export class HistorialMiembroService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateHistorialMiembroDto) {
    return this.prisma.historial_miembro.create({ data: createDto });
  }

  findAll() {
    return this.prisma.historial_miembro.findMany();
  }

  findOne(keys: { id_miembro: number; fecha_inicio: string }) {
    return this.prisma.historial_miembro.findUnique({
      where: {
        id_miembro_fecha_inicio: {
          id_miembro: BigInt(keys.id_miembro),
          fecha_inicio: new Date(keys.fecha_inicio),
        },
      },
    });
  }

  update(keys: { id_miembro: number; fecha_inicio: string }, updateDto: UpdateHistorialMiembroDto) {
    return this.prisma.historial_miembro.update({
      where: {
        id_miembro_fecha_inicio: {
          id_miembro: BigInt(keys.id_miembro),
          fecha_inicio: new Date(keys.fecha_inicio),
        },
      },
      data: updateDto,
    });
  }

  remove(keys: { id_miembro: number; fecha_inicio: string }) {
    return this.prisma.historial_miembro.delete({
      where: {
        id_miembro_fecha_inicio: {
          id_miembro: BigInt(keys.id_miembro),
          fecha_inicio: new Date(keys.fecha_inicio),
        },
      },
    });
  }
}
