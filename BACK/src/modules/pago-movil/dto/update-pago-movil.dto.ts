import { PartialType } from '@nestjs/mapped-types';
import { CreatePagoMovilDto } from './create-pago-movil.dto';

export class UpdatePagoMovilDto extends PartialType(CreatePagoMovilDto) {}
