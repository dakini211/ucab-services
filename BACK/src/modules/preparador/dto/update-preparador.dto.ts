import { PartialType } from '@nestjs/mapped-types';
import { CreatePreparadorDto } from './create-preparador.dto';

export class UpdatePreparadorDto extends PartialType(CreatePreparadorDto) {}
