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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.organizacionExternaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOrganizacionExternaDto: UpdateOrganizacionExternaDto) {
    return this.organizacionExternaService.update(+id, updateOrganizacionExternaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.organizacionExternaService.remove(+id);
  }
}
