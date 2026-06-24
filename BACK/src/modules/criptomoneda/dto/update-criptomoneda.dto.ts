import { PartialType } from '@nestjs/mapped-types';
import { CreateCriptomonedaDto } from './create-criptomoneda.dto';

export class UpdateCriptomonedaDto extends PartialType(CreateCriptomonedaDto) {}
