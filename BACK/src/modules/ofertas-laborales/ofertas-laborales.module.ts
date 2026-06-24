import { Module } from '@nestjs/common';
import { OfertasLaboralesService } from './ofertas-laborales.service';
import { OfertasLaboralesController } from './ofertas-laborales.controller';

@Module({
  controllers: [OfertasLaboralesController],
  providers: [OfertasLaboralesService],
})
export class OfertasLaboralesModule {}
