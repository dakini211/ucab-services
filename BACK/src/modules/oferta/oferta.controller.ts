import { Body, Controller, Get, Post, Request, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { OfertaService } from './oferta.service';
import { CreateOfertaDto } from './dto/create-oferta.dto';

/** Prefijo global 'api' (main.ts) => /api/oferta */
@UseGuards(AuthGuard('jwt'))
@Controller('oferta')
export class OfertaController {
  constructor(private readonly ofertaService: OfertaService) {}

  @Get('mis-postulaciones')
  misPostulaciones(@Request() req) {
    return this.ofertaService.misPostulaciones(req.user);
  }

  @Post()
  aplicar(@Request() req, @Body() dto: CreateOfertaDto) {
    return this.ofertaService.aplicar(req.user, dto);
  }
}
