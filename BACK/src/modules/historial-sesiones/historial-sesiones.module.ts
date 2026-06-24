import { Module } from '@nestjs/common';
import { HistorialSesionesService } from './historial-sesiones.service';
import { HistorialSesionesController } from './historial-sesiones.controller';

@Module({
  controllers: [HistorialSesionesController],
  providers: [HistorialSesionesService],
})
export class HistorialSesionesModule {}
