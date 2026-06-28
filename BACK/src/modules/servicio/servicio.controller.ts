import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { ServicioService } from './servicio.service';
import { CreateServicioDto } from './dto/create-servicio.dto';
import { UpdateServicioDto } from './dto/update-servicio.dto';

@Controller('servicio')
export class ServicioController {
  constructor(private readonly servicioService: ServicioService) {}

  @Post()
  create(@Body() createServicioDto: CreateServicioDto) {
    return this.servicioService.create(createServicioDto);
  }

  @Get()
  findAll() {
    return this.servicioService.findAll();
  }

  @Get(':id_servicio')
  findOne(@Param('id_servicio', ParseIntPipe) id_servicio: number) {
    return this.servicioService.findOne(id_servicio);
  }

  @Patch(':id_servicio')
  update(@Param('id_servicio', ParseIntPipe) id_servicio: number, @Body() updateServicioDto: UpdateServicioDto) {
    return this.servicioService.update(id_servicio, updateServicioDto);
  }

  @Delete(':id_servicio')
  remove(@Param('id_servicio', ParseIntPipe) id_servicio: number) {
    return this.servicioService.remove(id_servicio);
  }
}
