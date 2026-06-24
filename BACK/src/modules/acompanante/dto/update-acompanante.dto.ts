import { PartialType } from '@nestjs/mapped-types';
import { CreateAcompananteDto } from './create-acompanante.dto';

export class UpdateAcompananteDto extends PartialType(CreateAcompananteDto) {}
