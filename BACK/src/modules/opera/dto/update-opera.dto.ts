import { PartialType } from '@nestjs/mapped-types';
import { CreateOperaDto } from './create-opera.dto';

export class UpdateOperaDto extends PartialType(CreateOperaDto) {}
