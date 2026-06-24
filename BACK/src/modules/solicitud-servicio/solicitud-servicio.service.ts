import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class SolicitudServicioService {
  constructor(private prisma: PrismaService) {}

  create(createDto: any) {
    return this.prisma.solicitud_servicio.create({ data: createDto });
  }

  findAll() {
    return this.prisma.solicitud_servicio.findMany();
  }

  findOne(id: any) {
    // TODO: Ajustar si la tabla usa llave primaria compuesta o si el ID no es número
    return this.prisma.solicitud_servicio.findUnique({ where: { id_miembro: BigInt(id) } as any });
  }

  update(id: any, updateDto: any) {
    return this.prisma.solicitud_servicio.update({
      where: { id_miembro: BigInt(id) } as any,
      data: updateDto,
    });
  }

  remove(id: any) {
    return this.prisma.solicitud_servicio.delete({ where: { id_miembro: BigInt(id) } as any });
  }
}
