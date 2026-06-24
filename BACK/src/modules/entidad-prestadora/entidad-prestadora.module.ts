import { Module } from '@nestjs/common';
import { EntidadPrestadoraService } from './entidad-prestadora.service';
import { EntidadPrestadoraController } from './entidad-prestadora.controller';

@Module({
  controllers: [EntidadPrestadoraController],
  providers: [EntidadPrestadoraService],
})
export class EntidadPrestadoraModule {}
