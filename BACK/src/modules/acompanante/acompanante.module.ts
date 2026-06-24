import { Module } from '@nestjs/common';
import { AcompananteService } from './acompanante.service';
import { AcompananteController } from './acompanante.controller';

@Module({
  controllers: [AcompananteController],
  providers: [AcompananteService],
})
export class AcompananteModule {}
