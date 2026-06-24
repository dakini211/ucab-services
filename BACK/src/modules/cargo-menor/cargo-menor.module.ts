import { Module } from '@nestjs/common';
import { CargoMenorService } from './cargo-menor.service';
import { CargoMenorController } from './cargo-menor.controller';

@Module({
  controllers: [CargoMenorController],
  providers: [CargoMenorService],
})
export class CargoMenorModule {}
