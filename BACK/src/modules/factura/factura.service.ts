import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';

@Injectable()
export class FacturaService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateFacturaDto) {
    return this.prisma.factura.create({ data: createDto });
  }

  findAll() {
    return this.prisma.factura.findMany();
  }

  findOne(numero_de_control: string) {
    return this.prisma.factura.findUnique({ where: { numero_de_control } });
  }

  update(numero_de_control: string, updateDto: UpdateFacturaDto) {
    return this.prisma.factura.update({ where: { numero_de_control }, data: updateDto });
  }

  remove(numero_de_control: string) {
    return this.prisma.factura.delete({ where: { numero_de_control } });
  }
}
