import { Body, Controller, Delete, Get, Post, Query } from '@nestjs/common';
import { ItemsConsumoService } from './items-consumo.service';

/** Prefijo global 'api' => /api/items-consumo */
@Controller('items-consumo')
export class ItemsConsumoController {
  constructor(private readonly itemsConsumoService: ItemsConsumoService) {}

  @Get()
  findByFolio(
    @Query('id_miembro') id_miembro: string,
    @Query('id_servicio') id_servicio: string,
    @Query('fecha_de_creacion') fecha_de_creacion: string,
    @Query('nro_de_folio') nro_de_folio: string,
  ) {
    return this.itemsConsumoService.findByFolio({
      id_miembro,
      id_servicio: +id_servicio,
      fecha_de_creacion,
      nro_de_folio,
    });
  }

  @Post()
  create(@Body() dto: any) {
    return this.itemsConsumoService.create(dto);
  }

  /**
   * La PK tiene 5 columnas, asi que no cabe en :id.
   * Se recibe por query params.
   */
  @Delete()
  remove(
    @Query('id_miembro') id_miembro: string,
    @Query('id_servicio') id_servicio: string,
    @Query('fecha_de_creacion') fecha_de_creacion: string,
    @Query('nro_de_folio') nro_de_folio: string,
    @Query('concepto') concepto: string,
  ) {
    return this.itemsConsumoService.remove({
      id_miembro,
      id_servicio: +id_servicio,
      fecha_de_creacion,
      nro_de_folio,
      concepto,
    });
  }
}
