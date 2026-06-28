import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateAdministrativoDto } from './dto/create-administrativo.dto';
import { UpdateAdministrativoDto } from './dto/update-administrativo.dto';

@Injectable()
export class AdministrativoService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateAdministrativoDto) {
    return this.prisma.administrativo.create({ data: createDto });
  }

  findAll() {
    return this.prisma.administrativo.findMany();
  }

  findOne(id_miembro: string | number) {
    return this.prisma.administrativo.findUnique({ where: { id_miembro: BigInt(id_miembro) } });
  }

  update(id_miembro: string | number, updateDto: UpdateAdministrativoDto) {
    return this.prisma.administrativo.update({
      where: { id_miembro: BigInt(id_miembro) },
      data: updateDto,
    });
  }

  remove(id_miembro: string | number) {
    return this.prisma.administrativo.delete({ where: { id_miembro: BigInt(id_miembro) } });
  }
}
