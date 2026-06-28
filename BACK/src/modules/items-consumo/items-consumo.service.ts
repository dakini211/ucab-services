import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateItemsConsumoDto } from './dto/create-items-consumo.dto';
import { UpdateItemsConsumoDto } from './dto/update-items-consumo.dto';

@Injectable()
export class ItemsConsumoService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateItemsConsumoDto) {
    return this.prisma.items_consumo.create({ data: createDto });
  }

  findAll() {
    return this.prisma.items_consumo.findMany();
  }

  findOne(keys: { id_miembro: number; id_servicio: number; fecha_de_creacion: string; nro_de_folio: string; concepto: string }) {
    return this.prisma.items_consumo.findUnique({
      where: {
        id_miembro_id_servicio_fecha_de_creacion_nro_de_folio_concepto: {
          id_miembro: BigInt(keys.id_miembro),
          id_servicio: Number(keys.id_servicio),
          fecha_de_creacion: new Date(keys.fecha_de_creacion),
          nro_de_folio: keys.nro_de_folio,
          concepto: keys.concepto,
        },
      },
    });
  }

  update(keys: { id_miembro: number; id_servicio: number; fecha_de_creacion: string; nro_de_folio: string; concepto: string }, updateDto: UpdateItemsConsumoDto) {
    return this.prisma.items_consumo.update({
      where: {
        id_miembro_id_servicio_fecha_de_creacion_nro_de_folio_concepto: {
          id_miembro: BigInt(keys.id_miembro),
          id_servicio: Number(keys.id_servicio),
          fecha_de_creacion: new Date(keys.fecha_de_creacion),
          nro_de_folio: keys.nro_de_folio,
          concepto: keys.concepto,
        },
      },
      data: updateDto,
    });
  }

  remove(keys: { id_miembro: number; id_servicio: number; fecha_de_creacion: string; nro_de_folio: string; concepto: string }) {
    return this.prisma.items_consumo.delete({
      where: {
        id_miembro_id_servicio_fecha_de_creacion_nro_de_folio_concepto: {
          id_miembro: BigInt(keys.id_miembro),
          id_servicio: Number(keys.id_servicio),
          fecha_de_creacion: new Date(keys.fecha_de_creacion),
          nro_de_folio: keys.nro_de_folio,
          concepto: keys.concepto,
        },
      },
    });
  }
}
