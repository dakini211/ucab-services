import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AdministrativoService } from './administrativo.service';
import { CreateAdministrativoDto } from './dto/create-administrativo.dto';
import { UpdateAdministrativoDto } from './dto/update-administrativo.dto';

@Controller('administrativo')
export class AdministrativoController {
  constructor(private readonly administrativoService: AdministrativoService) {}

  @Post()
  create(@Body() createDto: CreateAdministrativoDto) {
    return this.administrativoService.create(createDto);
  }

  @Get()
  findAll() {
    return this.administrativoService.findAll();
  }

  @Get(':id_miembro')
  findOne(@Param('id_miembro') id_miembro: string) {
    return this.administrativoService.findOne(id_miembro);
  }

  @Patch(':id_miembro')
  update(@Param('id_miembro') id_miembro: string, @Body() updateDto: UpdateAdministrativoDto) {
    return this.administrativoService.update(id_miembro, updateDto);
  }

  @Delete(':id_miembro')
  remove(@Param('id_miembro') id_miembro: string) {
    return this.administrativoService.remove(id_miembro);
  }
}
