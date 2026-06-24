import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class HistorialMiembroService {
  constructor(private prisma: PrismaService) {}

  create(createDto: any) {
    return this.prisma.historial_miembro.create({ data: createDto });
  }

  findAll() {
    return this.prisma.historial_miembro.findMany();
  }

  findOne(id: any) {
    // TODO: Ajustar si la tabla usa llave primaria compuesta o si el ID no es número
    return this.prisma.historial_miembro.findUnique({ where: { id_miembro: BigInt(id) } as any });
  }

  update(id: any, updateDto: any) {
    return this.prisma.historial_miembro.update({
      where: { id_miembro: BigInt(id) } as any,
      data: updateDto,
    });
  }

  remove(id: any) {
    return this.prisma.historial_miembro.delete({ where: { id_miembro: BigInt(id) } as any });
  }
}
