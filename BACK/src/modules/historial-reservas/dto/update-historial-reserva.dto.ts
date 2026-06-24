import { PartialType } from '@nestjs/mapped-types';
import { CreateHistorialReservaDto } from './create-historial-reserva.dto';

export class UpdateHistorialReservaDto extends PartialType(CreateHistorialReservaDto) {}
