import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFamiliarDto } from './dto/create-familiar.dto';
import { UpdateFamiliarDto } from './dto/update-familiar.dto';

@Injectable()
export class FamiliarService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateFamiliarDto) {
    return this.prisma.familiar.create({ data: createDto });
  }

  findAll() {
    return this.prisma.familiar.findMany();
  }

  findOne(cedula: number) {
    return this.prisma.familiar.findUnique({ where: { cedula } });
  }

  update(cedula: number, updateDto: UpdateFamiliarDto) {
    return this.prisma.familiar.update({ where: { cedula }, data: updateDto });
  }

  remove(cedula: number) {
    return this.prisma.familiar.delete({ where: { cedula } });
  }
}
