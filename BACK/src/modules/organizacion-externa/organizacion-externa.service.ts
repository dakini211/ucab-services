import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOrganizacionExternaDto } from './dto/create-organizacion-externa.dto';
import { UpdateOrganizacionExternaDto } from './dto/update-organizacion-externa.dto';

@Injectable()
export class OrganizacionExternaService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateOrganizacionExternaDto) {
    return this.prisma.organizacion_externa.create({ data: createDto });
  }

  findAll() {
    return this.prisma.organizacion_externa.findMany();
  }

  findOne(nombre_entidad: string) {
    return this.prisma.organizacion_externa.findUnique({ where: { nombre_entidad } });
  }

  update(nombre_entidad: string, updateDto: UpdateOrganizacionExternaDto) {
    return this.prisma.organizacion_externa.update({ where: { nombre_entidad }, data: updateDto });
  }

  remove(nombre_entidad: string) {
    return this.prisma.organizacion_externa.delete({ where: { nombre_entidad } });
  }
}
