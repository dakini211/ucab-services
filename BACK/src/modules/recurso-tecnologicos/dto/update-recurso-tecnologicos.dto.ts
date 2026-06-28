import { PartialType } from '@nestjs/mapped-types';
import { CreateRecursoTecnologicosDto } from './create-recurso-tecnologicos.dto';

export class UpdateRecursoTecnologicosDto extends PartialType(CreateRecursoTecnologicosDto) {}
