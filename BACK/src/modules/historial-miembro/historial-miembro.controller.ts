import { Controller, Get, Post, Body, Patch, Delete } from '@nestjs/common';
import { HistorialMiembroService } from './historial-miembro.service';
import { CreateHistorialMiembroDto } from './dto/create-historial-miembro.dto';
import { UpdateHistorialMiembroDto } from './dto/update-historial-miembro.dto';

@Controller('historial-miembro')
export class HistorialMiembroController {
  constructor(private readonly historialMiembroService: HistorialMiembroService) {}

  @Post()
  create(@Body() createDto: CreateHistorialMiembroDto) {
    return this.historialMiembroService.create(createDto);
  }

  @Get()
  findAll() {
    return this.historialMiembroService.findAll();
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('find')
  findOne(@Body() keys: any) {
    return this.historialMiembroService.findOne(keys);
  }

  /** PK compuesta → { keys: {...}, data: {...} } */
  @Patch()
  update(@Body() body: { keys: any; data: UpdateHistorialMiembroDto }) {
    return this.historialMiembroService.update(body.keys, body.data);
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('delete')
  remove(@Body() keys: any) {
    return this.historialMiembroService.remove(keys);
  }
}
