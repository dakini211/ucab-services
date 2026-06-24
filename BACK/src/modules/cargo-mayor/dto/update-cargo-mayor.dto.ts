import { PartialType } from '@nestjs/mapped-types';
import { CreateCargoMayorDto } from './create-cargo-mayor.dto';

export class UpdateCargoMayorDto extends PartialType(CreateCargoMayorDto) {}
