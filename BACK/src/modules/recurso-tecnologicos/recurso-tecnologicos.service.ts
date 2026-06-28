import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateRecursoTecnologicosDto } from './dto/create-recurso-tecnologicos.dto';
import { UpdateRecursoTecnologicosDto } from './dto/update-recurso-tecnologicos.dto';

@Injectable()
export class RecursoTecnologicosService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateRecursoTecnologicosDto) {
    return this.prisma.recurso_tecnologicos.create({ data: createDto });
  }

  findAll() {
    return this.prisma.recurso_tecnologicos.findMany();
  }

  findOne(keys: { nombre_edificacion: string; direccion_interna: string; nro: number; descripcion: string }) {
    return this.prisma.recurso_tecnologicos.findUnique({
      where: {
        nombre_edificacion_direccion_interna_nro_descripcion: {
          nombre_edificacion: keys.nombre_edificacion,
          direccion_interna: keys.direccion_interna,
          nro: Number(keys.nro),
          descripcion: keys.descripcion,
        },
      },
    });
  }

  update(keys: { nombre_edificacion: string; direccion_interna: string; nro: number; descripcion: string }, updateDto: UpdateRecursoTecnologicosDto) {
    return this.prisma.recurso_tecnologicos.update({
      where: {
        nombre_edificacion_direccion_interna_nro_descripcion: {
          nombre_edificacion: keys.nombre_edificacion,
          direccion_interna: keys.direccion_interna,
          nro: Number(keys.nro),
          descripcion: keys.descripcion,
        },
      },
      data: updateDto,
    });
  }

  remove(keys: { nombre_edificacion: string; direccion_interna: string; nro: number; descripcion: string }) {
    return this.prisma.recurso_tecnologicos.delete({
      where: {
        nombre_edificacion_direccion_interna_nro_descripcion: {
          nombre_edificacion: keys.nombre_edificacion,
          direccion_interna: keys.direccion_interna,
          nro: Number(keys.nro),
          descripcion: keys.descripcion,
        },
      },
    });
  }
}
