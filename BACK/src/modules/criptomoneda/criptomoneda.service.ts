import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCriptomonedaDto } from './dto/create-criptomoneda.dto';
import { UpdateCriptomonedaDto } from './dto/update-criptomoneda.dto';

@Injectable()
export class CriptomonedaService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateCriptomonedaDto) {
    return this.prisma.criptomoneda.create({ data: createDto });
  }

  findAll() {
    return this.prisma.criptomoneda.findMany();
  }

  findOne(keys: { numero_de_control: string; fecha_operacion: string }) {
    return this.prisma.criptomoneda.findUnique({
      where: {
        numero_de_control_fecha_operacion: {
          numero_de_control: keys.numero_de_control,
          fecha_operacion: new Date(keys.fecha_operacion),
        },
      },
    });
  }

  update(keys: { numero_de_control: string; fecha_operacion: string }, updateDto: UpdateCriptomonedaDto) {
    return this.prisma.criptomoneda.update({
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
    return this.prisma.criptomoneda.delete({
      where: {
        numero_de_control_fecha_operacion: {
          numero_de_control: keys.numero_de_control,
          fecha_operacion: new Date(keys.fecha_operacion),
        },
      },
    });
  }
}
