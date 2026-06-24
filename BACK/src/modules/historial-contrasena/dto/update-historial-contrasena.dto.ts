import { PartialType } from '@nestjs/mapped-types';
import { CreateHistorialContrasenaDto } from './create-historial-contrasena.dto';

export class UpdateHistorialContrasenaDto extends PartialType(CreateHistorialContrasenaDto) {}
