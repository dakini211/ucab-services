import { PartialType } from '@nestjs/mapped-types';
import { CreateObtieneDto } from './create-obtiene.dto';

export class UpdateObtieneDto extends PartialType(CreateObtieneDto) {}
