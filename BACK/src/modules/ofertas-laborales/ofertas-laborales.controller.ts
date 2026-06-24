import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OfertasLaboralesService } from './ofertas-laborales.service';
import { CreateOfertasLaboraleDto } from './dto/create-ofertas-laborale.dto';
import { UpdateOfertasLaboraleDto } from './dto/update-ofertas-laborale.dto';

@Controller('ofertas-laborales')
export class OfertasLaboralesController {
  constructor(private readonly ofertasLaboralesService: OfertasLaboralesService) {}

  @Post()
  create(@Body() createOfertasLaboraleDto: CreateOfertasLaboraleDto) {
    return this.ofertasLaboralesService.create(createOfertasLaboraleDto);
  }

  @Get()
  findAll() {
    return this.ofertasLaboralesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.ofertasLaboralesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOfertasLaboraleDto: UpdateOfertasLaboraleDto) {
    return this.ofertasLaboralesService.update(+id, updateOfertasLaboraleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.ofertasLaboralesService.remove(+id);
  }
}
