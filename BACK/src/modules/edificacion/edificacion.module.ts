import { Module } from '@nestjs/common';
import { EdificacionService } from './edificacion.service';
import { EdificacionController } from './edificacion.controller';

@Module({
  controllers: [EdificacionController],
  providers: [EdificacionService],
})
export class EdificacionModule {}
