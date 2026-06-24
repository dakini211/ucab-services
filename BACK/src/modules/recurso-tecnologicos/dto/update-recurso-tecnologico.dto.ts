import { PartialType } from '@nestjs/mapped-types';
import { CreateRecursoTecnologicoDto } from './create-recurso-tecnologico.dto';

export class UpdateRecursoTecnologicoDto extends PartialType(CreateRecursoTecnologicoDto) {}
