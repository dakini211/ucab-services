import { Injectable } from '@nestjs/common';
import { CreateOfertasLaboraleDto } from './dto/create-ofertas-laborale.dto';
import { UpdateOfertasLaboraleDto } from './dto/update-ofertas-laborale.dto';

@Injectable()
export class OfertasLaboralesService {
  create(createOfertasLaboraleDto: CreateOfertasLaboraleDto) {
    return 'This action adds a new ofertasLaborale';
  }

  findAll() {
    return `This action returns all ofertasLaborales`;
  }

  findOne(id: number) {
    return `This action returns a #${id} ofertasLaborale`;
  }

  update(id: number, updateOfertasLaboraleDto: UpdateOfertasLaboraleDto) {
    return `This action updates a #${id} ofertasLaborale`;
  }

  remove(id: number) {
    return `This action removes a #${id} ofertasLaborale`;
  }
}
