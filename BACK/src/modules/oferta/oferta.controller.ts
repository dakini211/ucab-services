import { Controller, Get, Post, Body, Patch, Delete } from '@nestjs/common';
import { OfertaService } from './oferta.service';
import { CreateOfertaDto } from './dto/create-oferta.dto';
import { UpdateOfertaDto } from './dto/update-oferta.dto';

@Controller('oferta')
export class OfertaController {
  constructor(private readonly ofertaService: OfertaService) {}

  @Post()
  create(@Body() createDto: CreateOfertaDto) {
    return this.ofertaService.create(createDto);
  }

  @Get()
  findAll() {
    return this.ofertaService.findAll();
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('find')
  findOne(@Body() keys: any) {
    return this.ofertaService.findOne(keys);
  }

  /** PK compuesta → { keys: {...}, data: {...} } */
  @Patch()
  update(@Body() body: { keys: any; data: UpdateOfertaDto }) {
    return this.ofertaService.update(body.keys, body.data);
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('delete')
  remove(@Body() keys: any) {
    return this.ofertaService.remove(keys);
  }
}
