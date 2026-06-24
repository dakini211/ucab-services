import { PartialType } from '@nestjs/mapped-types';
import { CreatePersonalUcabDto } from './create-personal-ucab.dto';

export class UpdatePersonalUcabDto extends PartialType(CreatePersonalUcabDto) {}
