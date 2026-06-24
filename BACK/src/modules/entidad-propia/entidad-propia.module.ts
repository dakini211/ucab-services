import { Module } from '@nestjs/common';
import { EntidadPropiaService } from './entidad-propia.service';
import { EntidadPropiaController } from './entidad-propia.controller';

@Module({
  controllers: [EntidadPropiaController],
  providers: [EntidadPropiaService],
})
export class EntidadPropiaModule {}
