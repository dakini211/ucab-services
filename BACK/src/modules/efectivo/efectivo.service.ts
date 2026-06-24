import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class EfectivoService {
  constructor(private prisma: PrismaService) {}

  create(createDto: any) {
    return this.prisma.efectivo.create({ data: createDto });
  }

  findAll() {
    return this.prisma.efectivo.findMany();
  }

  findOne(id: any) {
    // TODO: Ajustar si la tabla usa llave primaria compuesta o si el ID no es número
    return this.prisma.efectivo.findUnique({ where: { id_miembro: BigInt(id) } as any });
  }

  update(id: any, updateDto: any) {
    return this.prisma.efectivo.update({
      where: { id_miembro: BigInt(id) } as any,
      data: updateDto,
    });
  }

  remove(id: any) {
    return this.prisma.efectivo.delete({ where: { id_miembro: BigInt(id) } as any });
  }
}
