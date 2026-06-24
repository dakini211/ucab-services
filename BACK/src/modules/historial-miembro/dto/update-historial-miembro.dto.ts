import { PartialType } from '@nestjs/mapped-types';
import { CreateHistorialMiembroDto } from './create-historial-miembro.dto';

export class UpdateHistorialMiembroDto extends PartialType(CreateHistorialMiembroDto) {}
