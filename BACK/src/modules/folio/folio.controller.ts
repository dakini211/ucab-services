import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import { FolioService } from './folio.service';

/**
 * Rutas del folio. Prefijo global 'api' (definido en main.ts) => /api/folio
 *
 * NOTA: no hay @Get(':id') ni @Patch(':id') porque folio tiene PK de 4
 * columnas. La clave viaja como query params en lugar de en la ruta.
 */
@Controller('folio')
export class FolioController {
  constructor(private readonly folioService: FolioService) {}

  // Las rutas literales van ANTES que cualquier parametrizada.
  @Get('stats')
  getStats() {
    return this.folioService.getStats();
  }

  @Get('solicitudes-sin-folio')
  getSolicitudesSinFolio() {
    return this.folioService.getSolicitudesSinFolio();
  }

  @Get('items')
  getItems(
    @Query('id_miembro') id_miembro: string,
    @Query('id_servicio') id_servicio: string,
    @Query('fecha_de_creacion') fecha_de_creacion: string,
    @Query('nro_de_folio') nro_de_folio: string,
  ) {
    return this.folioService.getItems({
      id_miembro,
      id_servicio: +id_servicio,
      fecha_de_creacion,
      nro_de_folio,
    });
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('estado') estado?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: string,
  ) {
    return this.folioService.findAll({
      search,
      estado,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      sortBy,
      order,
    });
  }

  @Post()
  abrir(@Body() dto: any) {
    return this.folioService.abrir(dto);
  }

  @Post('facturar')
  facturar(@Body() dto: any) {
    return this.folioService.facturar(
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
  cierreMasivo(@Body('mes') mes?: string) {
    return this.folioService.cierreMasivo(mes);
  }
}
