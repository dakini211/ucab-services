import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTarjetaDto } from './dto/create-tarjeta.dto';
import { UpdateTarjetaDto } from './dto/update-tarjeta.dto';

@Injectable()
export class TarjetaService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateTarjetaDto) {
    return this.prisma.tarjeta.create({ data: createDto });
  }

  findAll() {
    return this.prisma.tarjeta.findMany();
  }

  findOne(keys: { numero_de_control: string; fecha_operacion: string }) {
    return this.prisma.tarjeta.findUnique({
      where: {
        numero_de_control_fecha_operacion: {
          numero_de_control: keys.numero_de_control,
          fecha_operacion: new Date(keys.fecha_operacion),
        },
      },
    });
  }

  update(keys: { numero_de_control: string; fecha_operacion: string }, updateDto: UpdateTarjetaDto) {
    return this.prisma.tarjeta.update({
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
    return this.prisma.tarjeta.delete({
      where: {
        numero_de_control_fecha_operacion: {
          numero_de_control: keys.numero_de_control,
          fecha_operacion: new Date(keys.fecha_operacion),
        },
      },
    });
  }
}
