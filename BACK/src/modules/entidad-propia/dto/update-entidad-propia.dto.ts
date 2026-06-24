import { PartialType } from '@nestjs/mapped-types';
import { CreateEntidadPropiaDto } from './create-entidad-propia.dto';

export class UpdateEntidadPropiaDto extends PartialType(CreateEntidadPropiaDto) {}
