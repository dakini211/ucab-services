import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateHistorialReservasDto } from './dto/create-historial-reservas.dto';
import { UpdateHistorialReservasDto } from './dto/update-historial-reservas.dto';

@Injectable()
export class HistorialReservasService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateHistorialReservasDto) {
    return this.prisma.historial_reservas.create({ data: createDto });
  }

  findAll() {
    return this.prisma.historial_reservas.findMany();
  }

  findOne(keys: { id_servicio: number; nro: number; nombre_edificacion: string; direccion_interna: string; fecha_reserva: string }) {
    return this.prisma.historial_reservas.findUnique({
      where: {
        id_servicio_nro_nombre_edificacion_direccion_interna_fecha_reserva: {
          id_servicio: Number(keys.id_servicio),
          nro: Number(keys.nro),
          nombre_edificacion: keys.nombre_edificacion,
          direccion_interna: keys.direccion_interna,
          fecha_reserva: new Date(keys.fecha_reserva),
        },
      },
    });
  }

  update(keys: { id_servicio: number; nro: number; nombre_edificacion: string; direccion_interna: string; fecha_reserva: string }, updateDto: UpdateHistorialReservasDto) {
    return this.prisma.historial_reservas.update({
      where: {
        id_servicio_nro_nombre_edificacion_direccion_interna_fecha_reserva: {
          id_servicio: Number(keys.id_servicio),
          nro: Number(keys.nro),
          nombre_edificacion: keys.nombre_edificacion,
          direccion_interna: keys.direccion_interna,
          fecha_reserva: new Date(keys.fecha_reserva),
        },
      },
      data: updateDto,
    });
  }

  remove(keys: { id_servicio: number; nro: number; nombre_edificacion: string; direccion_interna: string; fecha_reserva: string }) {
    return this.prisma.historial_reservas.delete({
      where: {
        id_servicio_nro_nombre_edificacion_direccion_interna_fecha_reserva: {
          id_servicio: Number(keys.id_servicio),
          nro: Number(keys.nro),
          nombre_edificacion: keys.nombre_edificacion,
          direccion_interna: keys.direccion_interna,
          fecha_reserva: new Date(keys.fecha_reserva),
        },
      },
    });
  }
}
