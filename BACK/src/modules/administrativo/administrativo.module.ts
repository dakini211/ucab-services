import { Module } from '@nestjs/common';
import { AdministrativoService } from './administrativo.service';
import { AdministrativoController } from './administrativo.controller';

@Module({
  controllers: [AdministrativoController],
  providers: [AdministrativoService],
})
export class AdministrativoModule {}
