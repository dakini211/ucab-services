import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEfectivoDto } from './dto/create-efectivo.dto';
import { UpdateEfectivoDto } from './dto/update-efectivo.dto';

@Injectable()
export class EfectivoService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateEfectivoDto) {
    return this.prisma.efectivo.create({ data: createDto });
  }

  findAll() {
    return this.prisma.efectivo.findMany();
  }

  findOne(keys: { numero_de_control: string; fecha_operacion: string }) {
    return this.prisma.efectivo.findUnique({
      where: {
        numero_de_control_fecha_operacion: {
          numero_de_control: keys.numero_de_control,
          fecha_operacion: new Date(keys.fecha_operacion),
        },
      },
    });
  }

  update(keys: { numero_de_control: string; fecha_operacion: string }, updateDto: UpdateEfectivoDto) {
    return this.prisma.efectivo.update({
      where: {
        numero_de_control_fecha_operacion: {
          numero_de_control: keys.numero_de_control,
          fecha_operacion: new Date(keys.fecha_operacion),
        },
      },
      data: updateDto,
    });
  }

  remove(keys: { numero_de_control: string; fecha_operacion: string }) {
    return this.prisma.efectivo.delete({
      where: {
        numero_de_control_fecha_operacion: {
          numero_de_control: keys.numero_de_control,
          fecha_operacion: new Date(keys.fecha_operacion),
        },
      },
    });
  }
}
