import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSedeDto } from './dto/create-sede.dto';
import { UpdateSedeDto } from './dto/update-sede.dto';

@Injectable()
export class SedeService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateSedeDto) {
    return this.prisma.sede.create({ data: createDto });
  }

  findAll() {
    return this.prisma.sede.findMany();
  }

  findOne(nombre_sede: string) {
    return this.prisma.sede.findUnique({ where: { nombre_sede } });
  }

  update(nombre_sede: string, updateDto: UpdateSedeDto) {
    return this.prisma.sede.update({ where: { nombre_sede }, data: updateDto });
  }

  remove(nombre_sede: string) {
    return this.prisma.sede.delete({ where: { nombre_sede } });
  }
}
