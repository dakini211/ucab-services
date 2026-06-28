import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaiDto } from './dto/create-tai.dto';
import { UpdateTaiDto } from './dto/update-tai.dto';

@Injectable()
export class TaiService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateTaiDto) {
    return this.prisma.tai.create({ data: createDto });
  }

  findAll() {
    return this.prisma.tai.findMany();
  }

  findOne(keys: { numero_de_control: string; fecha_operacion: string }) {
    return this.prisma.tai.findUnique({
      where: {
        numero_de_control_fecha_operacion: {
          numero_de_control: keys.numero_de_control,
          fecha_operacion: new Date(keys.fecha_operacion),
        },
      },
    });
  }

  update(keys: { numero_de_control: string; fecha_operacion: string }, updateDto: UpdateTaiDto) {
    return this.prisma.tai.update({
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
    return this.prisma.tai.delete({
      where: {
        numero_de_control_fecha_operacion: {
          numero_de_control: keys.numero_de_control,
          fecha_operacion: new Date(keys.fecha_operacion),
        },
      },
    });
  }
}
