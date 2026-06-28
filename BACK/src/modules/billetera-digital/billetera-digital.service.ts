import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateBilleteraDigitalDto } from './dto/create-billetera-digital.dto';
import { UpdateBilleteraDigitalDto } from './dto/update-billetera-digital.dto';

@Injectable()
export class BilleteraDigitalService {
  constructor(private prisma: PrismaService) {}

  create(createDto: CreateBilleteraDigitalDto) {
    return this.prisma.billetera_digital.create({ data: createDto });
  }

  findAll() {
    return this.prisma.billetera_digital.findMany();
  }

  findOne(uid: string) {
    return this.prisma.billetera_digital.findUnique({ where: { uid } });
  }

  update(uid: string, updateDto: UpdateBilleteraDigitalDto) {
    return this.prisma.billetera_digital.update({
      where: { uid },
      data: updateDto,
    });
  }

  remove(uid: string) {
    return this.prisma.billetera_digital.delete({ where: { uid } });
  }
}
