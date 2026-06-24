import { Module } from '@nestjs/common';
import { OperaService } from './opera.service';
import { OperaController } from './opera.controller';

@Module({
  controllers: [OperaController],
  providers: [OperaService],
})
export class OperaModule {}
