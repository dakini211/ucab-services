import { PartialType } from '@nestjs/mapped-types';
import { CreateCargoMenorDto } from './create-cargo-menor.dto';

export class UpdateCargoMenorDto extends PartialType(CreateCargoMenorDto) {}
