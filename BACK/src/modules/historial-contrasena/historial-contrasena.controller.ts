import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HistorialContrasenaService } from './historial-contrasena.service';
import { CreateHistorialContrasenaDto } from './dto/create-historial-contrasena.dto';
import { UpdateHistorialContrasenaDto } from './dto/update-historial-contrasena.dto';

@Controller('historial-contrasena')
export class HistorialContrasenaController {
  constructor(private readonly historialContrasenaService: HistorialContrasenaService) {}

  @Post()
  create(@Body() createHistorialContrasenaDto: CreateHistorialContrasenaDto) {
    return this.historialContrasenaService.create(createHistorialContrasenaDto);
  }

  @Get()
  findAll() {
    return this.historialContrasenaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.historialContrasenaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHistorialContrasenaDto: UpdateHistorialContrasenaDto) {
    return this.historialContrasenaService.update(+id, updateHistorialContrasenaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.historialContrasenaService.remove(+id);
  }

  /**
   * POST /api/historial-contrasena/cambiar
   * Body: { id_miembro: number, nueva_contrasena: string }
   * Llama al stored procedure sp_cambiar_contrasena para cambiar la contraseña.
   */
  @Post('cambiar')
  cambiarContrasena(
    @Body('id_miembro') idMiembro: number,
    @Body('nueva_contrasena') nuevaContrasena: string,
  ) {
    return this.historialContrasenaService.cambiarContrasena(idMiembro, nuevaContrasena);
  }
}

