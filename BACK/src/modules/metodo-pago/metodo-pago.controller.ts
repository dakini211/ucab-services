import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { MetodoPagoService, RegistrarPagoDto } from './metodo-pago.service';

/** Prefijo global 'api' => /api/metodo-pago */
@Controller('metodo-pago')
export class MetodoPagoController {
  constructor(private readonly metodoPagoService: MetodoPagoService) {}

  @Post()
  registrar(@Body() dto: RegistrarPagoDto) {
    return this.metodoPagoService.registrar(dto);
  }

  @Get('factura/:numero')
  findByFactura(@Param('numero') numero: string) {
    return this.metodoPagoService.findByFactura(numero);
  }
}
