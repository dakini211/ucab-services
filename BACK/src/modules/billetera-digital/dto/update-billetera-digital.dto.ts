import { PartialType } from '@nestjs/mapped-types';
import { CreateBilleteraDigitalDto } from './create-billetera-digital.dto';

export class UpdateBilleteraDigitalDto extends PartialType(CreateBilleteraDigitalDto) {}
