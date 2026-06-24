import { PartialType } from '@nestjs/mapped-types';
import { CreateOfertaLaboralDto } from './create-oferta-laboral.dto';

export class UpdateOfertaLaboralDto extends PartialType(CreateOfertaLaboralDto) {}
