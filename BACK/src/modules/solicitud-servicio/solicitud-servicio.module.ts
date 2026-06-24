import { Module } from '@nestjs/common';
import { SolicitudServicioService } from './solicitud-servicio.service';
import { SolicitudServicioController } from './solicitud-servicio.controller';

@Module({
  controllers: [SolicitudServicioController],
  providers: [SolicitudServicioService],
})
export class SolicitudServicioModule {}
