import { Module } from '@nestjs/common';
import { CriptomonedaService } from './criptomoneda.service';
import { CriptomonedaController } from './criptomoneda.controller';

@Module({
  controllers: [CriptomonedaController],
  providers: [CriptomonedaService],
})
export class CriptomonedaModule {}
