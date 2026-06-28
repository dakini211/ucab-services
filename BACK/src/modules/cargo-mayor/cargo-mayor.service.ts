import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCargoMayorDto } from './dto/create-cargo-mayor.dto';
import { UpdateCargoMayorDto } from './dto/update-cargo-mayor.dto';

@Injectable()
export class CargoMayorService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateCargoMayorDto) {
    return this.prisma.cargo_mayor.create({ data: createDto });
  }

  findAll() {
    return this.prisma.cargo_mayor.findMany();
  }

  findOne(cedula: number) {
    return this.prisma.cargo_mayor.findUnique({ where: { cedula } });
  }

  update(cedula: number, updateDto: UpdateCargoMayorDto) {
    return this.prisma.cargo_mayor.update({
      where: { cedula },
      data: updateDto,
    });
  }

  remove(cedula: number) {
    return this.prisma.cargo_mayor.delete({ where: { cedula } });
  }
}
