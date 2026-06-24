import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PreparadorService } from './preparador.service';
import { CreatePreparadorDto } from './dto/create-preparador.dto';
import { UpdatePreparadorDto } from './dto/update-preparador.dto';

@Controller('preparador')
export class PreparadorController {
  constructor(private readonly preparadorService: PreparadorService) {}

  @Post()
  create(@Body() createPreparadorDto: CreatePreparadorDto) {
    return this.preparadorService.create(createPreparadorDto);
  }

  @Get()
  findAll() {
    return this.preparadorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.preparadorService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePreparadorDto: UpdatePreparadorDto) {
    return this.preparadorService.update(+id, updatePreparadorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.preparadorService.remove(+id);
  }
}
