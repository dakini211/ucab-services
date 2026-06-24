import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HistorialContrasenaService } from './historial-contrasena.service';
import { CreateHistorialContrasenaDto } from './dto/create-historial-contrasena.dto';
import { UpdateHistorialContrasenaDto } from './dto/update-historial-contrasena.dto';

@Controller('historial-contrasena')
export class HistorialContrasenaController {
  constructor(private readonly historialContrasenaService: HistorialContrasenaService) {}

  @Post()
  create(@Body() createHistorialContrasenaDto: CreateHistorialContrasenaDto) {
    return this.historialContrasenaService.create(createHistorialContrasenaDto);
  }

  @Get()
  findAll() {
    return this.historialContrasenaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.historialContrasenaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHistorialContrasenaDto: UpdateHistorialContrasenaDto) {
    return this.historialContrasenaService.update(+id, updateHistorialContrasenaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.historialContrasenaService.remove(+id);
  }
}
