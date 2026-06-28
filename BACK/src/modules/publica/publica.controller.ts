import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { PublicaService } from './publica.service';
import { CreatePublicaDto } from './dto/create-publica.dto';
import { UpdatePublicaDto } from './dto/update-publica.dto';

@Controller('publica')
export class PublicaController {
  constructor(private readonly publicaService: PublicaService) {}

  @Post()
  create(@Body() createPublicaDto: CreatePublicaDto) {
    return this.publicaService.create(createPublicaDto);
  }

  @Get()
  findAll() {
    return this.publicaService.findAll();
  }

  @Get(':id_servicio')
  findOne(@Param('id_servicio', ParseIntPipe) id_servicio: number) {
    return this.publicaService.findOne(id_servicio);
  }

  @Patch(':id_servicio')
  update(@Param('id_servicio', ParseIntPipe) id_servicio: number, @Body() updatePublicaDto: UpdatePublicaDto) {
    return this.publicaService.update(id_servicio, updatePublicaDto);
  }

  @Delete(':id_servicio')
  remove(@Param('id_servicio', ParseIntPipe) id_servicio: number) {
    return this.publicaService.remove(id_servicio);
  }
}
