import { Module } from '@nestjs/common';
import { EgresadoService } from './egresado.service';
import { EgresadoController } from './egresado.controller';

@Module({
  controllers: [EgresadoController],
  providers: [EgresadoService],
})
export class EgresadoModule {}
