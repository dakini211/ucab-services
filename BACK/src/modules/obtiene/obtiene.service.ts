import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateObtieneDto } from './dto/create-obtiene.dto';
import { UpdateObtieneDto } from './dto/update-obtiene.dto';

@Injectable()
export class ObtieneService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateObtieneDto) {
    return this.prisma.obtiene.create({ data: createDto });
  }

  findAll() {
    return this.prisma.obtiene.findMany();
  }

  findOne(keys: { numero_de_control: string; fecha_operacion: string; moneda_origen: string; moneda_destino: string; fecha_vigencia: string }) {
    return this.prisma.obtiene.findUnique({
      where: {
        numero_de_control_fecha_operacion_moneda_origen_moneda_destino_fecha_vigencia: {
          numero_de_control: keys.numero_de_control,
          fecha_operacion: new Date(keys.fecha_operacion),
          moneda_origen: keys.moneda_origen,
          moneda_destino: keys.moneda_destino,
          fecha_vigencia: new Date(keys.fecha_vigencia),
        },
      },
    });
  }

  update(keys: { numero_de_control: string; fecha_operacion: string; moneda_origen: string; moneda_destino: string; fecha_vigencia: string }, updateDto: UpdateObtieneDto) {
    return this.prisma.obtiene.update({
      where: {
        numero_de_control_fecha_operacion_moneda_origen_moneda_destino_fecha_vigencia: {
          numero_de_control: keys.numero_de_control,
          fecha_operacion: new Date(keys.fecha_operacion),
          moneda_origen: keys.moneda_origen,
          moneda_destino: keys.moneda_destino,
          fecha_vigencia: new Date(keys.fecha_vigencia),
        },
      },
      data: updateDto,
    });
  }

  remove(keys: { numero_de_control: string; fecha_operacion: string; moneda_origen: string; moneda_destino: string; fecha_vigencia: string }) {
    return this.prisma.obtiene.delete({
      where: {
        numero_de_control_fecha_operacion_moneda_origen_moneda_destino_fecha_vigencia: {
          numero_de_control: keys.numero_de_control,
          fecha_operacion: new Date(keys.fecha_operacion),
          moneda_origen: keys.moneda_origen,
          moneda_destino: keys.moneda_destino,
          fecha_vigencia: new Date(keys.fecha_vigencia),
        },
      },
    });
  }
}
