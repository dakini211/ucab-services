import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ItemsConsumoService {
  constructor(private prisma: PrismaService) {}

  create(createDto: any) {
    return this.prisma.items_consumo.create({ data: createDto });
  }

  findAll() {
    return this.prisma.items_consumo.findMany();
  }

  findOne(id: any) {
    // TODO: Ajustar si la tabla usa llave primaria compuesta o si el ID no es número
    return this.prisma.items_consumo.findUnique({ where: { id_miembro: BigInt(id) } as any });
  }

  update(id: any, updateDto: any) {
    return this.prisma.items_consumo.update({
      where: { id_miembro: BigInt(id) } as any,
      data: updateDto,
    });
  }

  remove(id: any) {
    return this.prisma.items_consumo.delete({ where: { id_miembro: BigInt(id) } as any });
  }
}
