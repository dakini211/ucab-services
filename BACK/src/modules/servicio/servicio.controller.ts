import { Controller, Get, Post, Body, Patch, Param, Delete, Query, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ServicioService } from './servicio.service';

@Controller('servicio')
export class ServicioController {
  constructor(private readonly servicioService: ServicioService) {}

  @Get('sedes')
  getSedes() {
    return this.servicioService.getSedes();
  }

  @Get('categorias')
  getCategorias() {
    return this.servicioService.getCategorias();
  }

  @Get('stats')
  getStats() {
    return this.servicioService.getStats();
  }

  @Post()
  create(@Body() createServicioDto: any) {
    return this.servicioService.create(createServicioDto);
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('categoria') categoria?: string,
    @Query('sede') sede?: string,
    @Query('estado') estado?: string,
    @Query('tipo') tipo?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.servicioService.findAll({ 
      search, 
      categoria, 
      sede, 
      estado, 
      tipo, 
      page: +(page || 1), 
      limit: +(limit || 10) 
    });
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.servicioService.findOne(+id);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post(':id/solicitar')
  solicitar(@Param('id') id: string, @Request() req) {
    return this.servicioService.solicitar(+id, req.user.id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateServicioDto: any) {
    return this.servicioService.update(+id, updateServicioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.servicioService.remove(+id);
  }
}
