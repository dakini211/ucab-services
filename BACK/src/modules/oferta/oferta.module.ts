import { Module } from '@nestjs/common';
import { OfertaService } from './oferta.service';
import { OfertaController } from './oferta.controller';

@Module({
  controllers: [OfertaController],
  providers: [OfertaService],
})
export class OfertaModule {}
