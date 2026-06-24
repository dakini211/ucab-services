import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.espacioFisicoService.findOne(+id);
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
