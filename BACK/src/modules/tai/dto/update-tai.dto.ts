import { PartialType } from '@nestjs/mapped-types';
import { CreateTaiDto } from './create-tai.dto';

export class UpdateTaiDto extends PartialType(CreateTaiDto) {}
