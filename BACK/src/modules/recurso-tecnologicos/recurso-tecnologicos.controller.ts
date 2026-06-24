import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { RecursoTecnologicosService } from './recurso-tecnologicos.service';
import { CreateRecursoTecnologicoDto } from './dto/create-recurso-tecnologico.dto';
import { UpdateRecursoTecnologicoDto } from './dto/update-recurso-tecnologico.dto';

@Controller('recurso-tecnologicos')
export class RecursoTecnologicosController {
  constructor(private readonly recursoTecnologicosService: RecursoTecnologicosService) {}

  @Post()
  create(@Body() createRecursoTecnologicoDto: CreateRecursoTecnologicoDto) {
    return this.recursoTecnologicosService.create(createRecursoTecnologicoDto);
  }

  @Get()
  findAll() {
    return this.recursoTecnologicosService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.recursoTecnologicosService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateRecursoTecnologicoDto: UpdateRecursoTecnologicoDto) {
    return this.recursoTecnologicosService.update(+id, updateRecursoTecnologicoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.recursoTecnologicosService.remove(+id);
  }
}
