import { Module } from '@nestjs/common';
import { ObtieneService } from './obtiene.service';
import { ObtieneController } from './obtiene.controller';

@Module({
  controllers: [ObtieneController],
  providers: [ObtieneService],
})
export class ObtieneModule {}
