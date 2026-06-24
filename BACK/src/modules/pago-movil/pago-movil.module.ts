import { Module } from '@nestjs/common';
import { PagoMovilService } from './pago-movil.service';
import { PagoMovilController } from './pago-movil.controller';

@Module({
  controllers: [PagoMovilController],
  providers: [PagoMovilService],
})
export class PagoMovilModule {}
