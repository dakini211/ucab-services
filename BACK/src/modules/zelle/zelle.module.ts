import { Module } from '@nestjs/common';
import { ZelleService } from './zelle.service';
import { ZelleController } from './zelle.controller';

@Module({
  controllers: [ZelleController],
  providers: [ZelleService],
})
export class ZelleModule {}
