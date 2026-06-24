import { PartialType } from '@nestjs/mapped-types';
import { CreateSolicitudServicioDto } from './create-solicitud-servicio.dto';

export class UpdateSolicitudServicioDto extends PartialType(CreateSolicitudServicioDto) {}
