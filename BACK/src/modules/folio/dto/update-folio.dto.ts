import { PartialType } from '@nestjs/mapped-types';
import { CreateFolioDto } from './create-folio.dto';

export class UpdateFolioDto extends PartialType(CreateFolioDto) {}
