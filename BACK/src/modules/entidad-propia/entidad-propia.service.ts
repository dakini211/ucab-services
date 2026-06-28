import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEntidadPropiaDto } from './dto/create-entidad-propia.dto';
import { UpdateEntidadPropiaDto } from './dto/update-entidad-propia.dto';

@Injectable()
export class EntidadPropiaService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateEntidadPropiaDto) {
    return this.prisma.entidad_propia.create({ data: createDto });
  }

  findAll() {
    return this.prisma.entidad_propia.findMany();
  }

  findOne(nombre_entidad: string) {
    return this.prisma.entidad_propia.findUnique({ where: { nombre_entidad } });
  }

  update(nombre_entidad: string, updateDto: UpdateEntidadPropiaDto) {
    return this.prisma.entidad_propia.update({ where: { nombre_entidad }, data: updateDto });
  }

  remove(nombre_entidad: string) {
    return this.prisma.entidad_propia.delete({ where: { nombre_entidad } });
  }
}
