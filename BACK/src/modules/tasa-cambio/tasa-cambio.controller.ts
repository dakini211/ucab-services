import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TasaCambioService } from './tasa-cambio.service';
import { CreateTasaCambioDto } from './dto/create-tasa-cambio.dto';
import { UpdateTasaCambioDto } from './dto/update-tasa-cambio.dto';

@Controller('tasa-cambio')
export class TasaCambioController {
  constructor(private readonly tasaCambioService: TasaCambioService) {}

  @Post()
  create(@Body() createTasaCambioDto: CreateTasaCambioDto) {
    return this.tasaCambioService.create(createTasaCambioDto);
  }

  @Get()
  findAll() {
    return this.tasaCambioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.tasaCambioService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTasaCambioDto: UpdateTasaCambioDto) {
    return this.tasaCambioService.update(+id, updateTasaCambioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.tasaCambioService.remove(+id);
  }
}
