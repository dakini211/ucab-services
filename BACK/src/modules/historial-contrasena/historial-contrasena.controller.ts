import { Controller, Get, Post, Body, Patch, Delete } from '@nestjs/common';
import { HistorialContrasenaService } from './historial-contrasena.service';
import { CreateHistorialContrasenaDto } from './dto/create-historial-contrasena.dto';
import { UpdateHistorialContrasenaDto } from './dto/update-historial-contrasena.dto';

@Controller('historial-contrasena')
export class HistorialContrasenaController {
  constructor(private readonly historialContrasenaService: HistorialContrasenaService) {}

  @Post()
  create(@Body() createDto: CreateHistorialContrasenaDto) {
    return this.historialContrasenaService.create(createDto);
  }

  @Get()
  findAll() {
    return this.historialContrasenaService.findAll();
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('find')
  findOne(@Body() keys: any) {
    return this.historialContrasenaService.findOne(keys);
  }

  /** PK compuesta → { keys: {...}, data: {...} } */
  @Patch()
  update(@Body() body: { keys: any; data: UpdateHistorialContrasenaDto }) {
    return this.historialContrasenaService.update(body.keys, body.data);
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('delete')
  remove(@Body() keys: any) {
    return this.historialContrasenaService.remove(keys);
  }
}
