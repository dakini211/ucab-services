import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEgresadoDto } from './dto/create-egresado.dto';
import { UpdateEgresadoDto } from './dto/update-egresado.dto';

@Injectable()
export class EgresadoService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateEgresadoDto) {
    return this.prisma.egresado.create({ data: createDto });
  }

  findAll() {
    return this.prisma.egresado.findMany();
  }

  findOne(id_miembro: string | number) {
    return this.prisma.egresado.findUnique({ where: { id_miembro: BigInt(id_miembro) } });
  }

  update(id_miembro: string | number, updateDto: UpdateEgresadoDto) {
    return this.prisma.egresado.update({
      where: { id_miembro: BigInt(id_miembro) },
      data: updateDto,
    });
  }

  remove(id_miembro: string | number) {
    return this.prisma.egresado.delete({ where: { id_miembro: BigInt(id_miembro) } });
  }
}
