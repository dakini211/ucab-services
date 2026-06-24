import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HistorialMiembroService } from './historial-miembro.service';
import { CreateHistorialMiembroDto } from './dto/create-historial-miembro.dto';
import { UpdateHistorialMiembroDto } from './dto/update-historial-miembro.dto';

@Controller('historial-miembro')
export class HistorialMiembroController {
  constructor(private readonly historialMiembroService: HistorialMiembroService) {}

  @Post()
  create(@Body() createHistorialMiembroDto: CreateHistorialMiembroDto) {
    return this.historialMiembroService.create(createHistorialMiembroDto);
  }

  @Get()
  findAll() {
    return this.historialMiembroService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.historialMiembroService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHistorialMiembroDto: UpdateHistorialMiembroDto) {
    return this.historialMiembroService.update(+id, updateHistorialMiembroDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.historialMiembroService.remove(+id);
  }
}
