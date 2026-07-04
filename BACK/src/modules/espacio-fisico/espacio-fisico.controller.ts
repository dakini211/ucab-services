import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EspacioFisicoService } from './espacio-fisico.service';
import { CreateEspacioFisicoDto } from './dto/create-espacio-fisico.dto';
import { UpdateEspacioFisicoDto } from './dto/update-espacio-fisico.dto';

@Controller('espacio-fisico')
export class EspacioFisicoController {
  constructor(private readonly espacioFisicoService: EspacioFisicoService) {}

  @Post()
  create(@Body() createEspacioFisicoDto: CreateEspacioFisicoDto) {
    return this.espacioFisicoService.create(createEspacioFisicoDto);
  }

  @Get()
  findAll() {
    return this.espacioFisicoService.findAll();
  }

  @Get('sedes')
  getSedes() {
    return this.espacioFisicoService.getSedes();
  }

  @Get('edificaciones')
  getEdificaciones() {
    return this.espacioFisicoService.getEdificaciones();
  }

  @Get('tipos')
  getTipos() {
    return this.espacioFisicoService.getTipos();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.espacioFisicoService.findOne(+id);
  }

  @Post(':id/reservar')
  reservar(@Param('id') id: string, @Body() body: any) {
    return this.espacioFisicoService.reservar(+id, body);
  }

  @Get(':id/reservas')
  getReservas(@Param('id') id: string, @Query('mes') mes?: string, @Query('anio') anio?: string) {
    return this.espacioFisicoService.getReservas(+id, mes, anio);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEspacioFisicoDto: UpdateEspacioFisicoDto) {
    return this.espacioFisicoService.update(+id, updateEspacioFisicoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.espacioFisicoService.remove(+id);
  }
}
