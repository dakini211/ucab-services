import { PartialType } from '@nestjs/mapped-types';
import { CreateHistorialReservasDto } from './create-historial-reservas.dto';

export class UpdateHistorialReservasDto extends PartialType(CreateHistorialReservasDto) {}
