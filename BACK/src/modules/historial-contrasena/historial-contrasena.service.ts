import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHistorialContrasenaDto } from './dto/create-historial-contrasena.dto';
import { UpdateHistorialContrasenaDto } from './dto/update-historial-contrasena.dto';

@Injectable()
export class HistorialContrasenaService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateHistorialContrasenaDto) {
    return this.prisma.historial_contrasena.create({ data: createDto });
  }

  findAll() {
    return this.prisma.historial_contrasena.findMany();
  }

  findOne(keys: { id_miembro: number; fecha_inicio: string }) {
    return this.prisma.historial_contrasena.findUnique({
      where: {
        id_miembro_fecha_inicio: {
          id_miembro: BigInt(keys.id_miembro),
          fecha_inicio: new Date(keys.fecha_inicio),
        },
      },
    });
  }

  update(keys: { id_miembro: number; fecha_inicio: string }, updateDto: UpdateHistorialContrasenaDto) {
    return this.prisma.historial_contrasena.update({
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
    return this.prisma.historial_contrasena.delete({
      where: {
        id_miembro_fecha_inicio: {
          id_miembro: BigInt(keys.id_miembro),
          fecha_inicio: new Date(keys.fecha_inicio),
        },
      },
    });
  }
}
