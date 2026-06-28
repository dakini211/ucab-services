import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAcompananteDto } from './dto/create-acompanante.dto';
import { UpdateAcompananteDto } from './dto/update-acompanante.dto';

@Injectable()
export class AcompananteService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateAcompananteDto) {
    return this.prisma.acompanante.create({ data: createDto });
  }

  findAll() {
    return this.prisma.acompanante.findMany();
  }

  findOne(keys: { id_miembro: number; id_servicio: number; fecha_de_creacion: string; ci: number }) {
    return this.prisma.acompanante.findUnique({
      where: {
        id_miembro_id_servicio_fecha_de_creacion_ci: {
          id_miembro: BigInt(keys.id_miembro),
          id_servicio: Number(keys.id_servicio),
          fecha_de_creacion: new Date(keys.fecha_de_creacion),
          ci: Number(keys.ci),
        },
      },
    });
  }

  update(keys: { id_miembro: number; id_servicio: number; fecha_de_creacion: string; ci: number }, updateDto: UpdateAcompananteDto) {
    return this.prisma.acompanante.update({
      where: {
        id_miembro_id_servicio_fecha_de_creacion_ci: {
          id_miembro: BigInt(keys.id_miembro),
          id_servicio: Number(keys.id_servicio),
          fecha_de_creacion: new Date(keys.fecha_de_creacion),
          ci: Number(keys.ci),
        },
      },
      data: updateDto,
    });
  }

  remove(keys: { id_miembro: number; id_servicio: number; fecha_de_creacion: string; ci: number }) {
    return this.prisma.acompanante.delete({
      where: {
        id_miembro_id_servicio_fecha_de_creacion_ci: {
          id_miembro: BigInt(keys.id_miembro),
          id_servicio: Number(keys.id_servicio),
          fecha_de_creacion: new Date(keys.fecha_de_creacion),
          ci: Number(keys.ci),
        },
      },
    });
  }
}
