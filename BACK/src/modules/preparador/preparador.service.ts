import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class PreparadorService {
  constructor(private prisma: PrismaService) {}

  create(createDto: any) {
    return this.prisma.preparador.create({ data: createDto });
  }

  findAll() {
    return this.prisma.preparador.findMany();
  }

  findOne(id: any) {
    // TODO: Ajustar si la tabla usa llave primaria compuesta o si el ID no es número
    return this.prisma.preparador.findUnique({ where: { id_miembro: BigInt(id) } as any });
  }

  update(id: any, updateDto: any) {
    return this.prisma.preparador.update({
      where: { id_miembro: BigInt(id) } as any,
      data: updateDto,
    });
  }

  remove(id: any) {
    return this.prisma.preparador.delete({ where: { id_miembro: BigInt(id) } as any });
  }
}
