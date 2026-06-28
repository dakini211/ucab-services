import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PreparadorService } from './preparador.service';
import { CreatePreparadorDto } from './dto/create-preparador.dto';
import { UpdatePreparadorDto } from './dto/update-preparador.dto';

@Controller('preparador')
export class PreparadorController {
  constructor(private readonly preparadorService: PreparadorService) {}

  @Post()
  create(@Body() createDto: CreatePreparadorDto) {
    return this.preparadorService.create(createDto);
  }

  @Get()
  findAll() {
    return this.preparadorService.findAll();
  }

  @Get(':id_miembro')
  findOne(@Param('id_miembro') id_miembro: string) {
    return this.preparadorService.findOne(id_miembro);
  }

  @Patch(':id_miembro')
  update(@Param('id_miembro') id_miembro: string, @Body() updateDto: UpdatePreparadorDto) {
    return this.preparadorService.update(id_miembro, updateDto);
  }

  @Delete(':id_miembro')
  remove(@Param('id_miembro') id_miembro: string) {
    return this.preparadorService.remove(id_miembro);
  }
}
