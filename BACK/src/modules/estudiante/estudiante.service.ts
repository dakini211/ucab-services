import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';

@Injectable()
export class EstudianteService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateEstudianteDto) {
    return this.prisma.estudiante.create({ data: createDto });
  }

  findAll() {
    return this.prisma.estudiante.findMany();
  }

  findOne(id_miembro: string | number) {
    return this.prisma.estudiante.findUnique({ where: { id_miembro: BigInt(id_miembro) } });
  }

  update(id_miembro: string | number, updateDto: UpdateEstudianteDto) {
    return this.prisma.estudiante.update({
      where: { id_miembro: BigInt(id_miembro) },
      data: updateDto,
    });
  }

  remove(id_miembro: string | number) {
    return this.prisma.estudiante.delete({ where: { id_miembro: BigInt(id_miembro) } });
  }
}
