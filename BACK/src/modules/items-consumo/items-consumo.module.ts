import { Module } from '@nestjs/common';
import { ItemsConsumoService } from './items-consumo.service';
import { ItemsConsumoController } from './items-consumo.controller';

@Module({
  controllers: [ItemsConsumoController],
  providers: [ItemsConsumoService],
})
export class ItemsConsumoModule {}
