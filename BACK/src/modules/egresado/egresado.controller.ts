import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EgresadoService } from './egresado.service';
import { CreateEgresadoDto } from './dto/create-egresado.dto';
import { UpdateEgresadoDto } from './dto/update-egresado.dto';

@Controller('egresado')
export class EgresadoController {
  constructor(private readonly egresadoService: EgresadoService) {}

  @Post()
  create(@Body() createDto: CreateEgresadoDto) {
    return this.egresadoService.create(createDto);
  }

  @Get()
  findAll() {
    return this.egresadoService.findAll();
  }

  @Get(':id_miembro')
  findOne(@Param('id_miembro') id_miembro: string) {
    return this.egresadoService.findOne(id_miembro);
  }

  @Patch(':id_miembro')
  update(@Param('id_miembro') id_miembro: string, @Body() updateDto: UpdateEgresadoDto) {
    return this.egresadoService.update(id_miembro, updateDto);
  }

  @Delete(':id_miembro')
  remove(@Param('id_miembro') id_miembro: string) {
    return this.egresadoService.remove(id_miembro);
  }
}
