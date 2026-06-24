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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.entidadPropiaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEntidadPropiaDto: UpdateEntidadPropiaDto) {
    return this.entidadPropiaService.update(+id, updateEntidadPropiaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.entidadPropiaService.remove(+id);
  }
}
