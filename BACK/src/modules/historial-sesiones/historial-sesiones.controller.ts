import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HistorialSesionesService } from './historial-sesiones.service';
import { CreateHistorialSesioneDto } from './dto/create-historial-sesione.dto';
import { UpdateHistorialSesioneDto } from './dto/update-historial-sesione.dto';

@Controller('historial-sesiones')
export class HistorialSesionesController {
  constructor(private readonly historialSesionesService: HistorialSesionesService) {}

  @Post()
  create(@Body() createHistorialSesioneDto: CreateHistorialSesioneDto) {
    return this.historialSesionesService.create(createHistorialSesioneDto);
  }

  @Get()
  findAll() {
    return this.historialSesionesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.historialSesionesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHistorialSesioneDto: UpdateHistorialSesioneDto) {
    return this.historialSesionesService.update(+id, updateHistorialSesioneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.historialSesionesService.remove(+id);
  }
}
