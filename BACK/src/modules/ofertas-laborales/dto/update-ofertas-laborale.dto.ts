import { PartialType } from '@nestjs/mapped-types';
import { CreateOfertasLaboraleDto } from './create-ofertas-laborale.dto';

export class UpdateOfertasLaboraleDto extends PartialType(CreateOfertasLaboraleDto) {}
