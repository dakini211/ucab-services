import { Controller, Get, Param, Query, UseGuards, Request, Delete } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { FacturaService } from './factura.service';

/** Prefijo global 'api' => /api/factura */
@UseGuards(AuthGuard('jwt'))
@Controller('factura')
export class FacturaController {
  constructor(private readonly facturaService: FacturaService) {}

  @Get('stats')
  getStats(@Request() req) {
    return this.facturaService.getStats(req.user);
  }

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
    return this.facturaService.findAll(req.user, {
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
  findOne(@Request() req, @Param('numero') numero: string) {
    return this.facturaService.findOne(req.user, numero);
  }

  @Delete(':numero')
  remove(@Request() req, @Param('numero') numero: string) {
    return this.facturaService.remove(req.user, numero);
  }
}
