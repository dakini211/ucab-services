import { Body, Controller, Get, Param, Post, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { MetodoPagoService } from './metodo-pago.service';
import { RegistrarPagoDto } from './dto/registrar-pago.dto';

/** Prefijo global 'api' => /api/metodo-pago */
@UseGuards(AuthGuard('jwt'))
@Controller('metodo-pago')
export class MetodoPagoController {
  constructor(private readonly metodoPagoService: MetodoPagoService) { }

  /**
   * RegistrarPagoDto debe ser CLASS, no interface: con emitDecoratorMetadata,
   * @Body() necesita una referencia viva en tiempo de ejecucion, y las
   * interfaces se borran al compilar a JavaScript.
   */
  @Post()
  registrar(@Request() req, @Body() dto: RegistrarPagoDto) {
    return this.metodoPagoService.registrar(req.user, dto);
  }

  @Get('factura/:numero')
  findByFactura(@Request() req, @Param('numero') numero: string) {
    return this.metodoPagoService.findByFactura(req.user, numero);
  }
}