import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OfertaLaboralService } from './oferta-laboral.service';
import { CreateOfertaLaboralDto } from './dto/create-oferta-laboral.dto';
import { UpdateOfertaLaboralDto } from './dto/update-oferta-laboral.dto';

@Controller('oferta-laboral')
export class OfertaLaboralController {
  constructor(private readonly ofertaLaboralService: OfertaLaboralService) {}

  @Post()
  create(@Body() createOfertaLaboralDto: CreateOfertaLaboralDto) {
    return this.ofertaLaboralService.create(createOfertaLaboralDto);
  }

  @Get()
  findAll() {
    return this.ofertaLaboralService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ofertaLaboralService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOfertaLaboralDto: UpdateOfertaLaboralDto) {
    return this.ofertaLaboralService.update(+id, updateOfertaLaboralDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ofertaLaboralService.remove(+id);
  }
}
