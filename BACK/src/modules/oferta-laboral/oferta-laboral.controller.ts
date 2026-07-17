import {
  Controller, ForbiddenException, Get, Query, Request, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OfertaLaboralService } from './oferta-laboral.service';

/** Solo Estudiante (consulta y postula) y Admin/admin_general (solo consulta) entran aquí. */
function verificarAcceso(user: any): void {
  if (user.rol !== 'Estudiante' && user.rol !== 'Admin') {
    throw new ForbiddenException('No tiene acceso al módulo de ofertas laborales.');
  }
}

/** Prefijo global 'api' (main.ts) => /api/ofertas_laborales */
@UseGuards(AuthGuard('jwt'))
@Controller('ofertas_laborales')
export class OfertaLaboralController {
  constructor(private readonly ofertaLaboralService: OfertaLaboralService) {}

  // Ruta literal antes que la parametrizada.
  @Get('stats')
  getStats(@Request() req) {
    verificarAcceso(req.user);
    return this.ofertaLaboralService.getStats();
  }

  @Get()
  findAll(
    @Request() req,
    @Query('search') search?: string,
    @Query('estatus') estatus?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    verificarAcceso(req.user);
    return this.ofertaLaboralService.findAll({
      search,
      estatus,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
    });
  }

  @Get('detail')
  findOne(
    @Request() req,
    @Query('nombre_entidad') nombre_entidad: string,
    @Query('cargo') cargo: string,
  ) {
    verificarAcceso(req.user);
    return this.ofertaLaboralService.findOne(nombre_entidad, cargo);
  }
}
