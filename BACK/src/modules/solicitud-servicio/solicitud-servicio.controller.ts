import { Controller, Get, Post, Body, Patch, Delete } from '@nestjs/common';
import { SolicitudServicioService } from './solicitud-servicio.service';
import { CreateSolicitudServicioDto } from './dto/create-solicitud-servicio.dto';
import { UpdateSolicitudServicioDto } from './dto/update-solicitud-servicio.dto';

@Controller('solicitud-servicio')
export class SolicitudServicioController {
  constructor(private readonly solicitudServicioService: SolicitudServicioService) {}

  @Post()
  create(@Body() createDto: CreateSolicitudServicioDto) {
    return this.solicitudServicioService.create(createDto);
  }

  @Get()
  findAll() {
    return this.solicitudServicioService.findAll();
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('find')
  findOne(@Body() keys: any) {
    return this.solicitudServicioService.findOne(keys);
  }

  /** PK compuesta → { keys: {...}, data: {...} } */
  @Patch()
  update(@Body() body: { keys: any; data: UpdateSolicitudServicioDto }) {
    return this.solicitudServicioService.update(body.keys, body.data);
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('delete')
  remove(@Body() keys: any) {
    return this.solicitudServicioService.remove(keys);
  }
}
