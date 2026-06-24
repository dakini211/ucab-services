import { Module } from '@nestjs/common';
import { HistoricoTarifaService } from './historico-tarifa.service';
import { HistoricoTarifaController } from './historico-tarifa.controller';

@Module({
  controllers: [HistoricoTarifaController],
  providers: [HistoricoTarifaService],
})
export class HistoricoTarifaModule {}
