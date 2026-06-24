import { Module } from '@nestjs/common';
import { PreparadorService } from './preparador.service';
import { PreparadorController } from './preparador.controller';

@Module({
  controllers: [PreparadorController],
  providers: [PreparadorService],
})
export class PreparadorModule {}
