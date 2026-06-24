import { PartialType } from '@nestjs/mapped-types';
import { CreateHistorialSesioneDto } from './create-historial-sesione.dto';

export class UpdateHistorialSesioneDto extends PartialType(CreateHistorialSesioneDto) {}
