import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SolicitudServicioService } from './solicitud-servicio.service';
import { CreateSolicitudServicioDto } from './dto/create-solicitud-servicio.dto';
import { UpdateSolicitudServicioDto } from './dto/update-solicitud-servicio.dto';

@Controller('solicitud-servicio')
export class SolicitudServicioController {
  constructor(private readonly solicitudServicioService: SolicitudServicioService) {}

  @Post()
  create(@Body() createSolicitudServicioDto: CreateSolicitudServicioDto) {
    return this.solicitudServicioService.create(createSolicitudServicioDto);
  }

  @Get()
  findAll() {
    return this.solicitudServicioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.solicitudServicioService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSolicitudServicioDto: UpdateSolicitudServicioDto) {
    return this.solicitudServicioService.update(+id, updateSolicitudServicioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.solicitudServicioService.remove(+id);
  }
}
