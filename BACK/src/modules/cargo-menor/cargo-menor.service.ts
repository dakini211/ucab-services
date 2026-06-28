import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateCargoMenorDto } from './dto/create-cargo-menor.dto';
import { UpdateCargoMenorDto } from './dto/update-cargo-menor.dto';

@Injectable()
export class CargoMenorService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateCargoMenorDto) {
    return this.prisma.cargo_menor.create({ data: createDto });
  }

  findAll() {
    return this.prisma.cargo_menor.findMany();
  }

  findOne(cedula: number) {
    return this.prisma.cargo_menor.findUnique({ where: { cedula } });
  }

  update(cedula: number, updateDto: UpdateCargoMenorDto) {
    return this.prisma.cargo_menor.update({
      where: { cedula },
      data: updateDto,
    });
  }

  remove(cedula: number) {
    return this.prisma.cargo_menor.delete({ where: { cedula } });
  }
}
