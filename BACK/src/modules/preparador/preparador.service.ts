import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePreparadorDto } from './dto/create-preparador.dto';
import { UpdatePreparadorDto } from './dto/update-preparador.dto';

@Injectable()
export class PreparadorService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreatePreparadorDto) {
    return this.prisma.preparador.create({ data: createDto });
  }

  findAll() {
    return this.prisma.preparador.findMany();
  }

  findOne(id_miembro: string | number) {
    return this.prisma.preparador.findUnique({ where: { id_miembro: BigInt(id_miembro) } });
  }

  update(id_miembro: string | number, updateDto: UpdatePreparadorDto) {
    return this.prisma.preparador.update({
      where: { id_miembro: BigInt(id_miembro) },
      data: updateDto,
    });
  }

  remove(id_miembro: string | number) {
    return this.prisma.preparador.delete({ where: { id_miembro: BigInt(id_miembro) } });
  }
}
