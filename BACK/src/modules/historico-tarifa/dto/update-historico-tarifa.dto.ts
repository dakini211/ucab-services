import { PartialType } from '@nestjs/mapped-types';
import { CreateHistoricoTarifaDto } from './create-historico-tarifa.dto';

export class UpdateHistoricoTarifaDto extends PartialType(CreateHistoricoTarifaDto) {}
