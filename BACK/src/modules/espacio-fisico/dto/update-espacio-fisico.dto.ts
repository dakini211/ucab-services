import { PartialType } from '@nestjs/mapped-types';
import { CreateEspacioFisicoDto } from './create-espacio-fisico.dto';

export class UpdateEspacioFisicoDto extends PartialType(CreateEspacioFisicoDto) {}
