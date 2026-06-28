import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHistoricoTarifaDto } from './dto/create-historico-tarifa.dto';
import { UpdateHistoricoTarifaDto } from './dto/update-historico-tarifa.dto';

@Injectable()
export class HistoricoTarifaService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateHistoricoTarifaDto) {
    return this.prisma.historico_tarifa.create({ data: createDto });
  }

  findAll() {
    return this.prisma.historico_tarifa.findMany();
  }

  findOne(keys: { id_servicio: number; fecha_inicio: string }) {
    return this.prisma.historico_tarifa.findUnique({
      where: {
        id_servicio_fecha_inicio: {
          id_servicio: Number(keys.id_servicio),
          fecha_inicio: new Date(keys.fecha_inicio),
        },
      },
    });
  }

  update(keys: { id_servicio: number; fecha_inicio: string }, updateDto: UpdateHistoricoTarifaDto) {
    return this.prisma.historico_tarifa.update({
      where: {
        id_servicio_fecha_inicio: {
          id_servicio: Number(keys.id_servicio),
          fecha_inicio: new Date(keys.fecha_inicio),
        },
      },
      data: updateDto,
    });
  }

  remove(keys: { id_servicio: number; fecha_inicio: string }) {
    return this.prisma.historico_tarifa.delete({
      where: {
        id_servicio_fecha_inicio: {
          id_servicio: Number(keys.id_servicio),
          fecha_inicio: new Date(keys.fecha_inicio),
        },
      },
    });
  }
}
