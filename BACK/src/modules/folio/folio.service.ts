import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFolioDto } from './dto/create-folio.dto';
import { UpdateFolioDto } from './dto/update-folio.dto';

@Injectable()
export class FolioService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateFolioDto) {
    return this.prisma.folio.create({ data: createDto });
  }

  findAll() {
    return this.prisma.folio.findMany();
  }

  findOne(keys: { id_miembro: number; id_servicio: number; fecha_de_creacion: string; nro_de_folio: string }) {
    return this.prisma.folio.findUnique({
      where: {
        id_miembro_id_servicio_fecha_de_creacion_nro_de_folio: {
          id_miembro: BigInt(keys.id_miembro),
          id_servicio: Number(keys.id_servicio),
          fecha_de_creacion: new Date(keys.fecha_de_creacion),
          nro_de_folio: keys.nro_de_folio,
        },
      },
    });
  }

  update(keys: { id_miembro: number; id_servicio: number; fecha_de_creacion: string; nro_de_folio: string }, updateDto: UpdateFolioDto) {
    return this.prisma.folio.update({
      where: {
        id_miembro_id_servicio_fecha_de_creacion_nro_de_folio: {
          id_miembro: BigInt(keys.id_miembro),
          id_servicio: Number(keys.id_servicio),
          fecha_de_creacion: new Date(keys.fecha_de_creacion),
          nro_de_folio: keys.nro_de_folio,
        },
      },
      data: updateDto,
    });
  }

  remove(keys: { id_miembro: number; id_servicio: number; fecha_de_creacion: string; nro_de_folio: string }) {
    return this.prisma.folio.delete({
      where: {
        id_miembro_id_servicio_fecha_de_creacion_nro_de_folio: {
          id_miembro: BigInt(keys.id_miembro),
          id_servicio: Number(keys.id_servicio),
          fecha_de_creacion: new Date(keys.fecha_de_creacion),
          nro_de_folio: keys.nro_de_folio,
        },
      },
    });
  }
}
