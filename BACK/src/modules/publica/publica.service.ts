import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePublicaDto } from './dto/create-publica.dto';
import { UpdatePublicaDto } from './dto/update-publica.dto';

@Injectable()
export class PublicaService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreatePublicaDto) {
    return this.prisma.publica.create({ data: createDto });
  }

  findAll() {
    return this.prisma.publica.findMany();
  }

  findOne(id_servicio: number) {
    return this.prisma.publica.findUnique({ where: { id_servicio } });
  }

  update(id_servicio: number, updateDto: UpdatePublicaDto) {
    return this.prisma.publica.update({ where: { id_servicio }, data: updateDto });
  }

  remove(id_servicio: number) {
    return this.prisma.publica.delete({ where: { id_servicio } });
  }
}
