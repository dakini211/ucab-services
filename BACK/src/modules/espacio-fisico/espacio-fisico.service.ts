import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEspacioFisicoDto } from './dto/create-espacio-fisico.dto';
import { UpdateEspacioFisicoDto } from './dto/update-espacio-fisico.dto';

@Injectable()
export class EspacioFisicoService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateEspacioFisicoDto) {
    return this.prisma.espacio_fisico.create({ data: createDto });
  }

  findAll() {
    return this.prisma.espacio_fisico.findMany();
  }

  findOne(keys: { nombre_edificacion: string; direccion_interna: string; nro: number }) {
    return this.prisma.espacio_fisico.findUnique({
      where: {
        nombre_edificacion_direccion_interna_nro: {
          nombre_edificacion: keys.nombre_edificacion,
          direccion_interna: keys.direccion_interna,
          nro: Number(keys.nro),
        },
      },
    });
  }

  update(keys: { nombre_edificacion: string; direccion_interna: string; nro: number }, updateDto: UpdateEspacioFisicoDto) {
    return this.prisma.espacio_fisico.update({
      where: {
        nombre_edificacion_direccion_interna_nro: {
          nombre_edificacion: keys.nombre_edificacion,
          direccion_interna: keys.direccion_interna,
          nro: Number(keys.nro),
        },
      },
      data: updateDto,
    });
  }

  remove(keys: { nombre_edificacion: string; direccion_interna: string; nro: number }) {
    return this.prisma.espacio_fisico.delete({
      where: {
        nombre_edificacion_direccion_interna_nro: {
          nombre_edificacion: keys.nombre_edificacion,
          direccion_interna: keys.direccion_interna,
          nro: Number(keys.nro),
        },
      },
    });
  }
}
