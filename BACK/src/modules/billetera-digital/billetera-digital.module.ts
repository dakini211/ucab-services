import { Module } from '@nestjs/common';
import { BilleteraDigitalService } from './billetera-digital.service';
import { BilleteraDigitalController } from './billetera-digital.controller';

@Module({
  controllers: [BilleteraDigitalController],
  providers: [BilleteraDigitalService],
})
export class BilleteraDigitalModule {}
