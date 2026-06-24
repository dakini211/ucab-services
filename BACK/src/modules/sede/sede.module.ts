import { Module } from '@nestjs/common';
import { SedeService } from './sede.service';
import { SedeController } from './sede.controller';

@Module({
  controllers: [SedeController],
  providers: [SedeService],
})
export class SedeModule {}
