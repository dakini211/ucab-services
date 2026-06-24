import { PartialType } from '@nestjs/mapped-types';
import { CreateOrganizacionExternaDto } from './create-organizacion-externa.dto';

export class UpdateOrganizacionExternaDto extends PartialType(CreateOrganizacionExternaDto) {}
