import { Module } from '@nestjs/common';
import { PublicaService } from './publica.service';
import { PublicaController } from './publica.controller';

@Module({
  controllers: [PublicaController],
  providers: [PublicaService],
})
export class PublicaModule {}
