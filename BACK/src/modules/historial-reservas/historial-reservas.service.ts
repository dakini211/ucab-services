import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HistorialReservasService {
  constructor(private prisma: PrismaService) {}

  create(createDto: any) {
    return this.prisma.historial_reservas.create({ data: createDto });
  }

  findAll() {
    return this.prisma.historial_reservas.findMany();
  }

  findOne(id: any) {
    // TODO: Ajustar si la tabla usa llave primaria compuesta o si el ID no es número
    return this.prisma.historial_reservas.findUnique({ where: { id_miembro: BigInt(id) } as any });
  }

  update(id: any, updateDto: any) {
    return this.prisma.historial_reservas.update({
      where: { id_miembro: BigInt(id) } as any,
      data: updateDto,
    });
  }

  remove(id: any) {
    return this.prisma.historial_reservas.delete({ where: { id_miembro: BigInt(id) } as any });
  }
}
