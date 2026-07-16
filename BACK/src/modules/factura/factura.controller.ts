import { Controller, Get, Param, Query } from '@nestjs/common';
import { FacturaService } from './factura.service';

/** Prefijo global 'api' => /api/factura */
@Controller('factura')
export class FacturaController {
  constructor(private readonly facturaService: FacturaService) {}

  @Get('stats')
  getStats() {
    return this.facturaService.getStats();
  }

  @Get()
  findAll(
    @Query('search') search?: string,
    @Query('estatus') estatus?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('sortBy') sortBy?: string,
    @Query('order') order?: string,
  ) {
    return this.facturaService.findAll({
      search,
      estatus,
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      sortBy,
      order,
    });
  }

  /**
   * numero_de_control es la PK real, y es VARCHAR: no lleva +numero como en
   * los modulos con id numerico.
   */
  @Get(':numero')
  findOne(@Param('numero') numero: string) {
    return this.facturaService.findOne(numero);
  }
}
