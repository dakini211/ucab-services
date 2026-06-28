import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTasaCambioDto } from './dto/create-tasa-cambio.dto';
import { UpdateTasaCambioDto } from './dto/update-tasa-cambio.dto';

@Injectable()
export class TasaCambioService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateTasaCambioDto) {
    return this.prisma.tasa_cambio.create({ data: createDto });
  }

  findAll() {
    return this.prisma.tasa_cambio.findMany();
  }

  findOne(keys: { moneda_origen: string; moneda_destino: string; fecha_vigencia: string }) {
    return this.prisma.tasa_cambio.findUnique({
      where: {
        moneda_origen_moneda_destino_fecha_vigencia: {
          moneda_origen: keys.moneda_origen,
          moneda_destino: keys.moneda_destino,
          fecha_vigencia: new Date(keys.fecha_vigencia),
        },
      },
    });
  }

  update(keys: { moneda_origen: string; moneda_destino: string; fecha_vigencia: string }, updateDto: UpdateTasaCambioDto) {
    return this.prisma.tasa_cambio.update({
      where: {
        moneda_origen_moneda_destino_fecha_vigencia: {
          moneda_origen: keys.moneda_origen,
          moneda_destino: keys.moneda_destino,
          fecha_vigencia: new Date(keys.fecha_vigencia),
        },
      },
      data: updateDto,
    });
  }

  remove(keys: { moneda_origen: string; moneda_destino: string; fecha_vigencia: string }) {
    return this.prisma.tasa_cambio.delete({
      where: {
        moneda_origen_moneda_destino_fecha_vigencia: {
          moneda_origen: keys.moneda_origen,
          moneda_destino: keys.moneda_destino,
          fecha_vigencia: new Date(keys.fecha_vigencia),
        },
      },
    });
  }
}
