import { PartialType } from '@nestjs/mapped-types';
import { CreatePublicaDto } from './create-publica.dto';

export class UpdatePublicaDto extends PartialType(CreatePublicaDto) {}
