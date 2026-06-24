import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EgresadoService } from './egresado.service';
import { CreateEgresadoDto } from './dto/create-egresado.dto';
import { UpdateEgresadoDto } from './dto/update-egresado.dto';

@Controller('egresado')
export class EgresadoController {
  constructor(private readonly egresadoService: EgresadoService) {}

  @Post()
  create(@Body() createEgresadoDto: CreateEgresadoDto) {
    return this.egresadoService.create(createEgresadoDto);
  }

  @Get()
  findAll() {
    return this.egresadoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.egresadoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEgresadoDto: UpdateEgresadoDto) {
    return this.egresadoService.update(+id, updateEgresadoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.egresadoService.remove(+id);
  }
}
