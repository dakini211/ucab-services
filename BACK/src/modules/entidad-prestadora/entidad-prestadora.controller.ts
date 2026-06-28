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

  @Get(':nombre_entidad')
  findOne(@Param('nombre_entidad') nombre_entidad: string) {
    return this.entidadPrestadoraService.findOne(nombre_entidad);
  }

  @Patch(':nombre_entidad')
  update(@Param('nombre_entidad') nombre_entidad: string, @Body() updateEntidadPrestadoraDto: UpdateEntidadPrestadoraDto) {
    return this.entidadPrestadoraService.update(nombre_entidad, updateEntidadPrestadoraDto);
  }

  @Delete(':nombre_entidad')
  remove(@Param('nombre_entidad') nombre_entidad: string) {
    return this.entidadPrestadoraService.remove(nombre_entidad);
  }
}
