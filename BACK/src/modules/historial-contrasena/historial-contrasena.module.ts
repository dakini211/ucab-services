import { Module } from '@nestjs/common';
import { HistorialContrasenaService } from './historial-contrasena.service';
import { HistorialContrasenaController } from './historial-contrasena.controller';

@Module({
  controllers: [HistorialContrasenaController],
  providers: [HistorialContrasenaService],
})
export class HistorialContrasenaModule {}
