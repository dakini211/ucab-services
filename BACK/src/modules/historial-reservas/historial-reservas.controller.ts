import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HistorialReservasService } from './historial-reservas.service';
import { CreateHistorialReservaDto } from './dto/create-historial-reserva.dto';
import { UpdateHistorialReservaDto } from './dto/update-historial-reserva.dto';

@Controller('historial-reservas')
export class HistorialReservasController {
  constructor(private readonly historialReservasService: HistorialReservasService) {}

  @Post()
  create(@Body() createHistorialReservaDto: CreateHistorialReservaDto) {
    return this.historialReservasService.create(createHistorialReservaDto);
  }

  @Get()
  findAll() {
    return this.historialReservasService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.historialReservasService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHistorialReservaDto: UpdateHistorialReservaDto) {
    return this.historialReservasService.update(+id, updateHistorialReservaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.historialReservasService.remove(+id);
  }
}
