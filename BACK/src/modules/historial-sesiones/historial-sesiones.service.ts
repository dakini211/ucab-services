import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHistorialSesionesDto } from './dto/create-historial-sesiones.dto';
import { UpdateHistorialSesionesDto } from './dto/update-historial-sesiones.dto';

@Injectable()
export class HistorialSesionesService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateHistorialSesionesDto) {
    return this.prisma.historial_sesiones.create({ data: createDto });
  }

  findAll() {
    return this.prisma.historial_sesiones.findMany();
  }

  findOne(keys: { id_miembro: number; identificador_uuid: number }) {
    return this.prisma.historial_sesiones.findUnique({
      where: {
        id_miembro_identificador_uuid: {
          id_miembro: BigInt(keys.id_miembro),
          identificador_uuid: BigInt(keys.identificador_uuid),
        },
      },
    });
  }

  update(keys: { id_miembro: number; identificador_uuid: number }, updateDto: UpdateHistorialSesionesDto) {
    return this.prisma.historial_sesiones.update({
      where: {
        id_miembro_identificador_uuid: {
          id_miembro: BigInt(keys.id_miembro),
          identificador_uuid: BigInt(keys.identificador_uuid),
        },
      },
      data: updateDto,
    });
  }

  remove(keys: { id_miembro: number; identificador_uuid: number }) {
    return this.prisma.historial_sesiones.delete({
      where: {
        id_miembro_identificador_uuid: {
          id_miembro: BigInt(keys.id_miembro),
          identificador_uuid: BigInt(keys.identificador_uuid),
        },
      },
    });
  }
}
