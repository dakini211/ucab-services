import { PartialType } from '@nestjs/mapped-types';
import { CreateEdificacionDto } from './create-edificacion.dto';

export class UpdateEdificacionDto extends PartialType(CreateEdificacionDto) {}
