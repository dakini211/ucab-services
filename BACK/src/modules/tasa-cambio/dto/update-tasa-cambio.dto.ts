import { PartialType } from '@nestjs/mapped-types';
import { CreateTasaCambioDto } from './create-tasa-cambio.dto';

export class UpdateTasaCambioDto extends PartialType(CreateTasaCambioDto) {}
