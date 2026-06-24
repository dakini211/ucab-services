import { Module } from '@nestjs/common';
import { HistorialMiembroService } from './historial-miembro.service';
import { HistorialMiembroController } from './historial-miembro.controller';

@Module({
  controllers: [HistorialMiembroController],
  providers: [HistorialMiembroService],
})
export class HistorialMiembroModule {}
