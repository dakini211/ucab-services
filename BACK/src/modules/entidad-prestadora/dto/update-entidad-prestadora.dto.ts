import { PartialType } from '@nestjs/mapped-types';
import { CreateEntidadPrestadoraDto } from './create-entidad-prestadora.dto';

export class UpdateEntidadPrestadoraDto extends PartialType(CreateEntidadPrestadoraDto) {}
