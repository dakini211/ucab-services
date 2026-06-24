import { Module } from '@nestjs/common';
import { HistorialReservasService } from './historial-reservas.service';
import { HistorialReservasController } from './historial-reservas.controller';

@Module({
  controllers: [HistorialReservasController],
  providers: [HistorialReservasService],
})
export class HistorialReservasModule {}
