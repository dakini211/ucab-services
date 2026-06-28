import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateOperaDto } from './dto/create-opera.dto';
import { UpdateOperaDto } from './dto/update-opera.dto';

@Injectable()
export class OperaService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateOperaDto) {
    return this.prisma.opera.create({ data: createDto });
  }

  findAll() {
    return this.prisma.opera.findMany();
  }

  findOne(nombre_entidad: string) {
    return this.prisma.opera.findUnique({ where: { nombre_entidad } });
  }

  update(nombre_entidad: string, updateDto: UpdateOperaDto) {
    return this.prisma.opera.update({ where: { nombre_entidad }, data: updateDto });
  }

  remove(nombre_entidad: string) {
    return this.prisma.opera.delete({ where: { nombre_entidad } });
  }
}
