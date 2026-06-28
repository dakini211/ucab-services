import { Controller, Get, Post, Body, Patch, Delete } from '@nestjs/common';
import { HistorialReservasService } from './historial-reservas.service';
import { CreateHistorialReservasDto } from './dto/create-historial-reservas.dto';
import { UpdateHistorialReservasDto } from './dto/update-historial-reservas.dto';

@Controller('historial-reservas')
export class HistorialReservasController {
  constructor(private readonly historialReservasService: HistorialReservasService) {}

  @Post()
  create(@Body() createDto: CreateHistorialReservasDto) {
    return this.historialReservasService.create(createDto);
  }

  @Get()
  findAll() {
    return this.historialReservasService.findAll();
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('find')
  findOne(@Body() keys: any) {
    return this.historialReservasService.findOne(keys);
  }

  /** PK compuesta → { keys: {...}, data: {...} } */
  @Patch()
  update(@Body() body: { keys: any; data: UpdateHistorialReservasDto }) {
    return this.historialReservasService.update(body.keys, body.data);
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('delete')
  remove(@Body() keys: any) {
    return this.historialReservasService.remove(keys);
  }
}
