import { Module } from '@nestjs/common';
import { EntidadesService } from './entidades.service';
import { EntidadesController } from './entidades.controller';

@Module({
  controllers: [EntidadesController],
  providers: [EntidadesService],
})
export class EntidadesModule {}
