import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EntidadPrestadoraService } from './entidad-prestadora.service';
import { CreateEntidadPrestadoraDto } from './dto/create-entidad-prestadora.dto';
import { UpdateEntidadPrestadoraDto } from './dto/update-entidad-prestadora.dto';

@Controller('entidad-prestadora')
export class EntidadPrestadoraController {
  constructor(private readonly entidadPrestadoraService: EntidadPrestadoraService) {}

  @Post()
  create(@Body() createEntidadPrestadoraDto: CreateEntidadPrestadoraDto) {
    return this.entidadPrestadoraService.create(createEntidadPrestadoraDto);
  }

  @Get()
  findAll() {
    return this.entidadPrestadoraService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.entidadPrestadoraService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEntidadPrestadoraDto: UpdateEntidadPrestadoraDto) {
    return this.entidadPrestadoraService.update(+id, updateEntidadPrestadoraDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.entidadPrestadoraService.remove(+id);
  }
}
