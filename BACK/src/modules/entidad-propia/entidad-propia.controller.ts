import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EntidadPropiaService } from './entidad-propia.service';
import { CreateEntidadPropiaDto } from './dto/create-entidad-propia.dto';
import { UpdateEntidadPropiaDto } from './dto/update-entidad-propia.dto';

@Controller('entidad-propia')
export class EntidadPropiaController {
  constructor(private readonly entidadPropiaService: EntidadPropiaService) {}

  @Post()
  create(@Body() createEntidadPropiaDto: CreateEntidadPropiaDto) {
    return this.entidadPropiaService.create(createEntidadPropiaDto);
  }

  @Get()
  findAll() {
    return this.entidadPropiaService.findAll();
  }

  @Get(':nombre_entidad')
  findOne(@Param('nombre_entidad') nombre_entidad: string) {
    return this.entidadPropiaService.findOne(nombre_entidad);
  }

  @Patch(':nombre_entidad')
  update(@Param('nombre_entidad') nombre_entidad: string, @Body() updateEntidadPropiaDto: UpdateEntidadPropiaDto) {
    return this.entidadPropiaService.update(nombre_entidad, updateEntidadPropiaDto);
  }

  @Delete(':nombre_entidad')
  remove(@Param('nombre_entidad') nombre_entidad: string) {
    return this.entidadPropiaService.remove(nombre_entidad);
  }
}
