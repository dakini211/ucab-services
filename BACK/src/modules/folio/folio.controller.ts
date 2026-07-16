import { Body, Controller, Get, Post, Query, UseGuards, Request, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FolioService } from './folio.service';

/**
 * Rutas del folio. Prefijo global 'api' (definido en main.ts) => /api/folio
 *
 * NOTA: no hay @Get(':id') ni @Patch(':id') porque folio tiene PK de 4
 * columnas. La clave viaja como query params en lugar de en la ruta.
 */
@UseGuards(AuthGuard('jwt'))
@Controller('folio')
export class FolioController {
  constructor(private readonly folioService: FolioService) {}

  // Las rutas literales van ANTES que cualquier parametrizada.
  @Get('stats')
  getStats(@Request() req) {
    return this.folioService.getStats(req.user);
  }

  @Get('solicitudes-sin-folio')
  getSolicitudesSinFolio(@Request() req) {
    return this.folioService.getSolicitudesSinFolio(req.user);
  }

  @Get('items')
  getItems(
    @Request() req,
    @Query('id_miembro') id_miembro: string,
    @Query('id_servicio') id_servicio: string,
    @Query('fecha_de_creacion') fecha_de_creacion: string,
    @Query('nro_de_folio') nro_de_folio: string,
  ) {
    return this.folioService.getItems(req.user, {
      id_miembro,
      id_servicio: +id_servicio,
      fecha_de_creacion,
      nro_de_folio,
    });
  }

  @Get()
  findAll(
    @Request() req,
    @Query('search') search?: string,
    @Query('estado') estado?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: string,
  ) {
    return this.folioService.findAll(req.user, {
      search,
      estado,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      sortBy,
      order,
    });
  }

  @Post()
  abrir(@Request() req, @Body() dto: any) {
    return this.folioService.abrir(req.user, dto);
  }

  @Post('facturar')
  facturar(@Request() req, @Body() dto: any) {
    return this.folioService.facturar(
      req.user,
      {
        id_miembro: dto.id_miembro,
        id_servicio: dto.id_servicio,
        fecha_de_creacion: dto.fecha_de_creacion,
        nro_de_folio: dto.nro_de_folio,
      },
      dto.numero_de_control,
    );
  }

  @Post('cierre-masivo')
  cierreMasivo(@Request() req, @Body('mes') mes?: string) {
    return this.folioService.cierreMasivo(req.user, mes);
  }

  @Delete()
  remove(
    @Request() req,
    @Query('id_miembro') id_miembro: string,
    @Query('id_servicio') id_servicio: string,
    @Query('fecha_de_creacion') fecha_de_creacion: string,
    @Query('nro_de_folio') nro_de_folio: string,
  ) {
    return this.folioService.remove(req.user, {
      id_miembro,
      id_servicio: +id_servicio,
      fecha_de_creacion,
      nro_de_folio,
    });
  }
}
