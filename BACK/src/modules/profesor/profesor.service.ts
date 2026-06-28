import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateProfesorDto } from './dto/create-profesor.dto';
import { UpdateProfesorDto } from './dto/update-profesor.dto';

@Injectable()
export class ProfesorService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateProfesorDto) {
    return this.prisma.profesor.create({ data: createDto });
  }

  findAll() {
    return this.prisma.profesor.findMany();
  }

  findOne(id_miembro: string | number) {
    return this.prisma.profesor.findUnique({ where: { id_miembro: BigInt(id_miembro) } });
  }

  update(id_miembro: string | number, updateDto: UpdateProfesorDto) {
    return this.prisma.profesor.update({
      where: { id_miembro: BigInt(id_miembro) },
      data: updateDto,
    });
  }

  remove(id_miembro: string | number) {
    return this.prisma.profesor.delete({ where: { id_miembro: BigInt(id_miembro) } });
  }
}
