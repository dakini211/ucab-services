import { PartialType } from '@nestjs/mapped-types';
import { CreateHistorialSesionesDto } from './create-historial-sesiones.dto';

export class UpdateHistorialSesionesDto extends PartialType(CreateHistorialSesionesDto) {}
