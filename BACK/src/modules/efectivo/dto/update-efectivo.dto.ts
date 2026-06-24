import { PartialType } from '@nestjs/mapped-types';
import { CreateEfectivoDto } from './create-efectivo.dto';

export class UpdateEfectivoDto extends PartialType(CreateEfectivoDto) {}
