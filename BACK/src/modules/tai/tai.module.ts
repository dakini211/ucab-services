import { Module } from '@nestjs/common';
import { TaiService } from './tai.service';
import { TaiController } from './tai.controller';

@Module({
  controllers: [TaiController],
  providers: [TaiService],
})
export class TaiModule {}
