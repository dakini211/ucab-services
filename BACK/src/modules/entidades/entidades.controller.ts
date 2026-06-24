import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EntidadesService } from './entidades.service';
import { CreateEntidadeDto } from './dto/create-entidade.dto';
import { UpdateEntidadeDto } from './dto/update-entidade.dto';

@Controller('entidades')
export class EntidadesController {
  constructor(private readonly entidadesService: EntidadesService) {}

  @Post()
  create(@Body() createEntidadeDto: CreateEntidadeDto) {
    return this.entidadesService.create(createEntidadeDto);
  }

  @Get()
  findAll() {
    return this.entidadesService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.entidadesService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEntidadeDto: UpdateEntidadeDto) {
    return this.entidadesService.update(+id, updateEntidadeDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.entidadesService.remove(+id);
  }
}
