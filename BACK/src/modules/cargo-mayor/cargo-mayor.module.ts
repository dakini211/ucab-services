import { Module } from '@nestjs/common';
import { CargoMayorService } from './cargo-mayor.service';
import { CargoMayorController } from './cargo-mayor.controller';

@Module({
  controllers: [CargoMayorController],
  providers: [CargoMayorService],
})
export class CargoMayorModule {}
