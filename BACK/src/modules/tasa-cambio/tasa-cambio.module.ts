import { Module } from '@nestjs/common';
import { TasaCambioService } from './tasa-cambio.service';
import { TasaCambioController } from './tasa-cambio.controller';

@Module({
  controllers: [TasaCambioController],
  providers: [TasaCambioService],
})
export class TasaCambioModule {}
