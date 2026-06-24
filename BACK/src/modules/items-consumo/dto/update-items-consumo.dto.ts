import { PartialType } from '@nestjs/mapped-types';
import { CreateItemsConsumoDto } from './create-items-consumo.dto';

export class UpdateItemsConsumoDto extends PartialType(CreateItemsConsumoDto) {}
