import { Module } from '@nestjs/common';
import { OfertaLaboralService } from './oferta-laboral.service';
import { OfertaLaboralController } from './oferta-laboral.controller';

@Module({
  controllers: [OfertaLaboralController],
  providers: [OfertaLaboralService],
  exports: [OfertaLaboralService],
})
export class OfertaLaboralModule {}
