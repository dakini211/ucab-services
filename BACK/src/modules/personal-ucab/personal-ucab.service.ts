import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreatePersonalUcabDto } from './dto/create-personal-ucab.dto';
import { UpdatePersonalUcabDto } from './dto/update-personal-ucab.dto';

@Injectable()
export class PersonalUcabService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreatePersonalUcabDto) {
    return this.prisma.personal_ucab.create({ data: createDto });
  }

  findAll() {
    return this.prisma.personal_ucab.findMany();
  }

  findOne(id_miembro: string | number) {
    return this.prisma.personal_ucab.findUnique({ where: { id_miembro: BigInt(id_miembro) } });
  }

  update(id_miembro: string | number, updateDto: UpdatePersonalUcabDto) {
    return this.prisma.personal_ucab.update({
      where: { id_miembro: BigInt(id_miembro) },
      data: updateDto,
    });
  }

  remove(id_miembro: string | number) {
    return this.prisma.personal_ucab.delete({ where: { id_miembro: BigInt(id_miembro) } });
  }
}
