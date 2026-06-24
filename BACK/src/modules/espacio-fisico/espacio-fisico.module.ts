import { Module } from '@nestjs/common';
import { EspacioFisicoService } from './espacio-fisico.service';
import { EspacioFisicoController } from './espacio-fisico.controller';

@Module({
  controllers: [EspacioFisicoController],
  providers: [EspacioFisicoService],
})
export class EspacioFisicoModule {}
