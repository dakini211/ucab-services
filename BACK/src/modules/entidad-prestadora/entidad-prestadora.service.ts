import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEntidadPrestadoraDto } from './dto/create-entidad-prestadora.dto';
import { UpdateEntidadPrestadoraDto } from './dto/update-entidad-prestadora.dto';

@Injectable()
export class EntidadPrestadoraService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateEntidadPrestadoraDto) {
    return this.prisma.entidad_prestadora.create({ data: createDto });
  }

  findAll() {
    return this.prisma.entidad_prestadora.findMany();
  }

  findOne(nombre_entidad: string) {
    return this.prisma.entidad_prestadora.findUnique({ where: { nombre_entidad } });
  }

  update(nombre_entidad: string, updateDto: UpdateEntidadPrestadoraDto) {
    return this.prisma.entidad_prestadora.update({ where: { nombre_entidad }, data: updateDto });
  }

  remove(nombre_entidad: string) {
    return this.prisma.entidad_prestadora.delete({ where: { nombre_entidad } });
  }
}
