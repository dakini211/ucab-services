import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { EdificacionService } from './edificacion.service';
import { CreateEdificacionDto } from './dto/create-edificacion.dto';
import { UpdateEdificacionDto } from './dto/update-edificacion.dto';

@Controller('edificacion')
export class EdificacionController {
  constructor(private readonly edificacionService: EdificacionService) {}

  @Get('sedes')
  getSedes() {
    return this.edificacionService.getSedes();
  }

  @Get('stats')
  getStats() {
    return this.edificacionService.getStats();
  }

  @Post()
  create(@Body() createEdificacionDto: any) {
    return this.edificacionService.create(createEdificacionDto);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('sede') sede?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.edificacionService.findAll({ search, sede, page: +(page || 1), limit: +(limit || 10) });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.edificacionService.findOne(+id);
  }

  @Patch(':id/estado')
  updateEstado(@Param('id') id: string, @Body('estado') estado: string) {
    return this.edificacionService.updateEstado(+id, estado);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEdificacionDto: any) {
    return this.edificacionService.update(+id, updateEdificacionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.edificacionService.remove(+id);
  }
}
