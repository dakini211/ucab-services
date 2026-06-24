import { Module } from '@nestjs/common';
import { EfectivoService } from './efectivo.service';
import { EfectivoController } from './efectivo.controller';

@Module({
  controllers: [EfectivoController],
  providers: [EfectivoService],
})
export class EfectivoModule {}
