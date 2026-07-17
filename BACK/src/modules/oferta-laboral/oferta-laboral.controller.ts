import {
  Body, Controller, ForbiddenException, Get, Post, Query, Request, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OfertaLaboralService } from './oferta-laboral.service';
import { CreateOfertaDto } from './dto/create-oferta.dto';

/** Solo Estudiante (consulta y postula) y Admin (solo consulta) entran aquí. */
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

  // ── Rutas literales ANTES de cualquier parametrizada ──────────────────────

  @Get('stats')
  getStats(@Request() req) {
    verificarAcceso(req.user);
    return this.ofertaLaboralService.getStats();
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

  @Get('mis-postulaciones')
  misPostulaciones(@Request() req) {
    verificarAcceso(req.user);
    return this.ofertaLaboralService.misPostulaciones(req.user);
  }

  @Get('sugeridas')
  sugeridas(@Request() req) {
    verificarAcceso(req.user);
    return this.ofertaLaboralService.sugeridas(req.user);
  }

  // ── Listado ───────────────────────────────────────────────────────────────

  @Get()
  findAll(
    @Request() req,
    @Query('search') search?: string,
    @Query('estatus') estatus?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: string,
  ) {
    verificarAcceso(req.user);
    return this.ofertaLaboralService.findAll({
      search,
      estatus,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      sortBy,
      order,
    });
  }

  // ── Postulación ───────────────────────────────────────────────────────────

  /**
   * Antes vivía en el módulo `oferta` como POST /api/oferta. Al unificarse los
   * dos módulos, la ruta pasa a POST /api/ofertas_laborales/postular.
   * Hay que actualizar ofertas-laborales.service.ts en el front.
   */
  @Post('postular')
  aplicar(@Request() req, @Body() dto: CreateOfertaDto) {
    return this.ofertaLaboralService.aplicar(req.user, dto);
  }
}
