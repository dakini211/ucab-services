import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateSolicitudServicioDto } from './dto/create-solicitud-servicio.dto';
import { UpdateSolicitudServicioDto } from './dto/update-solicitud-servicio.dto';

@Injectable()
export class SolicitudServicioService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateSolicitudServicioDto) {
    return this.prisma.solicitud_servicio.create({ data: createDto });
  }

  findAll() {
    return this.prisma.solicitud_servicio.findMany();
  }

  findOne(keys: { id_miembro: number; id_servicio: number; fecha_de_creacion: string }) {
    return this.prisma.solicitud_servicio.findUnique({
      where: {
        id_miembro_id_servicio_fecha_de_creacion: {
          id_miembro: BigInt(keys.id_miembro),
          id_servicio: Number(keys.id_servicio),
          fecha_de_creacion: new Date(keys.fecha_de_creacion),
        },
      },
    });
  }

  update(keys: { id_miembro: number; id_servicio: number; fecha_de_creacion: string }, updateDto: UpdateSolicitudServicioDto) {
    return this.prisma.solicitud_servicio.update({
      where: {
        id_miembro_id_servicio_fecha_de_creacion: {
          id_miembro: BigInt(keys.id_miembro),
          id_servicio: Number(keys.id_servicio),
          fecha_de_creacion: new Date(keys.fecha_de_creacion),
        },
      },
      data: updateDto,
    });
  }

  remove(keys: { id_miembro: number; id_servicio: number; fecha_de_creacion: string }) {
    return this.prisma.solicitud_servicio.delete({
      where: {
        id_miembro_id_servicio_fecha_de_creacion: {
          id_miembro: BigInt(keys.id_miembro),
          id_servicio: Number(keys.id_servicio),
          fecha_de_creacion: new Date(keys.fecha_de_creacion),
        },
      },
    });
  }
}
