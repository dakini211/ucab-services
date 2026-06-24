import { Module } from '@nestjs/common';
import { OrganizacionExternaService } from './organizacion-externa.service';
import { OrganizacionExternaController } from './organizacion-externa.controller';

@Module({
  controllers: [OrganizacionExternaController],
  providers: [OrganizacionExternaService],
})
export class OrganizacionExternaModule {}
