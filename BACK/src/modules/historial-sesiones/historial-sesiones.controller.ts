import { Controller, Get, Post, Body, Patch, Delete } from '@nestjs/common';
import { HistorialSesionesService } from './historial-sesiones.service';
import { CreateHistorialSesionesDto } from './dto/create-historial-sesiones.dto';
import { UpdateHistorialSesionesDto } from './dto/update-historial-sesiones.dto';

@Controller('historial-sesiones')
export class HistorialSesionesController {
  constructor(private readonly historialSesionesService: HistorialSesionesService) {}

  @Post()
  create(@Body() createDto: CreateHistorialSesionesDto) {
    return this.historialSesionesService.create(createDto);
  }

  @Get()
  findAll() {
    return this.historialSesionesService.findAll();
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('find')
  findOne(@Body() keys: any) {
    return this.historialSesionesService.findOne(keys);
  }

  /** PK compuesta → { keys: {...}, data: {...} } */
  @Patch()
  update(@Body() body: { keys: any; data: UpdateHistorialSesionesDto }) {
    return this.historialSesionesService.update(body.keys, body.data);
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('delete')
  remove(@Body() keys: any) {
    return this.historialSesionesService.remove(keys);
  }
}
