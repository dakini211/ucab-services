import { PartialType } from '@nestjs/mapped-types';
import { CreateZelleDto } from './create-zelle.dto';

export class UpdateZelleDto extends PartialType(CreateZelleDto) {}
