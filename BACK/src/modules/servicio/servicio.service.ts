import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';

@Injectable()
export class ServicioService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateServicioDto) {
    return this.prisma.servicio.create({ data: createDto });
  }

  findAll() {
    return this.prisma.servicio.findMany();
  }

  findOne(id_servicio: number) {
    return this.prisma.servicio.findUnique({ where: { id_servicio } });
  }

  update(id_servicio: number, updateDto: UpdateServicioDto) {
    return this.prisma.servicio.update({ where: { id_servicio }, data: updateDto });
  }

  remove(id_servicio: number) {
    return this.prisma.servicio.delete({ where: { id_servicio } });
  }
}
