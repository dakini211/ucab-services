import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OrganizacionExternaService } from './organizacion-externa.service';
import { CreateOrganizacionExternaDto } from './dto/create-organizacion-externa.dto';
import { UpdateOrganizacionExternaDto } from './dto/update-organizacion-externa.dto';

@Controller('organizacion-externa')
export class OrganizacionExternaController {
  constructor(private readonly organizacionExternaService: OrganizacionExternaService) {}

  @Post()
  create(@Body() createOrganizacionExternaDto: CreateOrganizacionExternaDto) {
    return this.organizacionExternaService.create(createOrganizacionExternaDto);
  }

  @Get()
  findAll() {
    return this.organizacionExternaService.findAll();
  }

  @Get(':nombre_entidad')
  findOne(@Param('nombre_entidad') nombre_entidad: string) {
    return this.organizacionExternaService.findOne(nombre_entidad);
  }

  @Patch(':nombre_entidad')
  update(@Param('nombre_entidad') nombre_entidad: string, @Body() updateOrganizacionExternaDto: UpdateOrganizacionExternaDto) {
    return this.organizacionExternaService.update(nombre_entidad, updateOrganizacionExternaDto);
  }

  @Delete(':nombre_entidad')
  remove(@Param('nombre_entidad') nombre_entidad: string) {
    return this.organizacionExternaService.remove(nombre_entidad);
  }
}
