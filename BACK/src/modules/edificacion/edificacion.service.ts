import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEdificacionDto } from './dto/create-edificacion.dto';
import { UpdateEdificacionDto } from './dto/update-edificacion.dto';

@Injectable()
export class EdificacionService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateEdificacionDto) {
    return this.prisma.edificacion.create({ data: createDto });
  }

  findAll() {
    return this.prisma.edificacion.findMany();
  }

  findOne(keys: { nombre_edificacion: string; direccion_interna: string }) {
    return this.prisma.edificacion.findUnique({
      where: {
        nombre_edificacion_direccion_interna: {
          nombre_edificacion: keys.nombre_edificacion,
          direccion_interna: keys.direccion_interna,
        },
      },
    });
  }

  update(keys: { nombre_edificacion: string; direccion_interna: string }, updateDto: UpdateEdificacionDto) {
    return this.prisma.edificacion.update({
      where: {
        nombre_edificacion_direccion_interna: {
          nombre_edificacion: keys.nombre_edificacion,
          direccion_interna: keys.direccion_interna,
        },
      },
      data: updateDto,
    });
  }

  remove(keys: { nombre_edificacion: string; direccion_interna: string }) {
    return this.prisma.edificacion.delete({
      where: {
        nombre_edificacion_direccion_interna: {
          nombre_edificacion: keys.nombre_edificacion,
          direccion_interna: keys.direccion_interna,
        },
      },
    });
  }
}
