import { Controller, Get, Post, Body, Patch, Delete } from '@nestjs/common';
import { OfertaLaboralService } from './oferta-laboral.service';
import { CreateOfertaLaboralDto } from './dto/create-oferta-laboral.dto';
import { UpdateOfertaLaboralDto } from './dto/update-oferta-laboral.dto';

@Controller('oferta-laboral')
export class OfertaLaboralController {
  constructor(private readonly ofertaLaboralService: OfertaLaboralService) {}

  @Post()
  create(@Body() createDto: CreateOfertaLaboralDto) {
    return this.ofertaLaboralService.create(createDto);
  }

  @Get()
  findAll() {
    return this.ofertaLaboralService.findAll();
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('find')
  findOne(@Body() keys: any) {
    return this.ofertaLaboralService.findOne(keys);
  }

  /** PK compuesta → { keys: {...}, data: {...} } */
  @Patch()
  update(@Body() body: { keys: any; data: UpdateOfertaLaboralDto }) {
    return this.ofertaLaboralService.update(body.keys, body.data);
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('delete')
  remove(@Body() keys: any) {
    return this.ofertaLaboralService.remove(keys);
  }
}
