import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { MiembroService } from './miembro.service';
import { CreateMiembroDto } from './dto/create-miembro.dto';
import { UpdateMiembroDto } from './dto/update-miembro.dto';

@Controller('miembro')
export class MiembroController {
  constructor(private readonly miembroService: MiembroService) { }

  @Post()
  create(@Body() createMiembroDto: CreateMiembroDto) {
    return this.miembroService.create(createMiembroDto);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('tipoVinculacion') tipoVinculacion?: string,
    @Query('estadoCuenta') estadoCuenta?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.miembroService.findAll({
      search,
      tipoVinculacion,
      estadoCuenta,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.miembroService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateMiembroDto: UpdateMiembroDto) {
    return this.miembroService.update(id, updateMiembroDto);
  }

  @Patch(':id/estado')
  updateEstado(@Param('id') id: string, @Body('estado') estado: string) {
    return this.miembroService.updateEstado(id, estado);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.miembroService.remove(id);
  }
}
