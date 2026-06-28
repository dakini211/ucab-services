import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePagoMovilDto } from './dto/create-pago-movil.dto';
import { UpdatePagoMovilDto } from './dto/update-pago-movil.dto';

@Injectable()
export class PagoMovilService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreatePagoMovilDto) {
    return this.prisma.pago_movil.create({ data: createDto });
  }

  findAll() {
    return this.prisma.pago_movil.findMany();
  }

  findOne(keys: { numero_de_control: string; fecha_operacion: string }) {
    return this.prisma.pago_movil.findUnique({
      where: {
        numero_de_control_fecha_operacion: {
          numero_de_control: keys.numero_de_control,
          fecha_operacion: new Date(keys.fecha_operacion),
        },
      },
    });
  }

  update(keys: { numero_de_control: string; fecha_operacion: string }, updateDto: UpdatePagoMovilDto) {
    return this.prisma.pago_movil.update({
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
    return this.prisma.pago_movil.delete({
      where: {
        numero_de_control_fecha_operacion: {
          numero_de_control: keys.numero_de_control,
          fecha_operacion: new Date(keys.fecha_operacion),
        },
      },
    });
  }
}
