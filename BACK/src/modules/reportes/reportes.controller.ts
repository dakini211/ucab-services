import { Controller, ForbiddenException, Get, Query, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ReportesService } from './reportes.service';

/** Solo Admin (administrativo con admin_general) entra aquí. */
function verificarAcceso(user: any): void {
  if (user.rol !== 'Admin') {
    throw new ForbiddenException('No tiene acceso al módulo de reportes.');
  }
}

@Controller('reportes')
@UseGuards(AuthGuard('jwt'))
export class ReportesController {
  constructor(private readonly reportesService: ReportesService) {}

  /** KPIs generales: miembros, estados, beneficiarios */
  @Get('kpis')
  getKpis(@Request() req) {
    verificarAcceso(req.user);
    return this.reportesService.getKpisGenerales();
  }

  /** Servicios: solicitudes por estado, top servicios. Filtros: estado, desde, hasta */
  @Get('servicios')
  getServicios(
    @Request() req,
    @Query('estado') estado?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
  ) {
    verificarAcceso(req.user);
    return this.reportesService.getReporteServicios({ estado, desde, hasta });
  }

  /** Infraestructura: edificaciones, espacios, recursos. Filtros: tipo, edificacion */
  @Get('infraestructura')
  getInfraestructura(
    @Request() req,
    @Query('tipo') tipo?: string,
    @Query('edificacion') edificacion?: string,
  ) {
    verificarAcceso(req.user);
    return this.reportesService.getReporteInfraestructura({ tipo, edificacion });
  }

  /** Finanzas: folios, billeteras, tasas de cambio. Filtros: estado, desde, hasta, moneda */
  @Get('finanzas')
  getFinanzas(
    @Request() req,
    @Query('estado') estado?: string,
    @Query('desde') desde?: string,
    @Query('hasta') hasta?: string,
    @Query('moneda') moneda?: string,
  ) {
    verificarAcceso(req.user);
    return this.reportesService.getReporteFinanzas({ estado, desde, hasta, moneda });
  }

  /** Ofertas laborales: por estatus, top postuladas. Filtros: estatus, entidad */
  @Get('ofertas-laborales')
  getOfertasLaborales(
    @Request() req,
    @Query('estatus') estatus?: string,
    @Query('entidad') entidad?: string,
  ) {
    verificarAcceso(req.user);
    return this.reportesService.getReporteOfertasLaborales({ estatus, entidad });
  }

  /** Valores reales disponibles en la BD para poblar los selects de filtro */
  @Get('opciones-filtro')
  getOpcionesFiltro(@Request() req) {
    verificarAcceso(req.user);
    return this.reportesService.getOpcionesFiltro();
  }

  /**
   * Resumen COMPLETO de toda la BD + alertas de cuellos de botella.
   * Este es el endpoint principal para el dashboard IA.
   * Cuando tengas tokens de IA, aquí se invocará el análisis masivo.
   */
  @Get('resumen-completo')
  getResumenCompleto(@Request() req) {
    verificarAcceso(req.user);
    return this.reportesService.getResumenCompleto();
  }
}
