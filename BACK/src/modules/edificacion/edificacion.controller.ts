import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EdificacionService } from './edificacion.service';
import { CreateEdificacionDto } from './dto/create-edificacion.dto';
import { UpdateEdificacionDto } from './dto/update-edificacion.dto';

@Controller('edificacion')
export class EdificacionController {
  constructor(private readonly edificacionService: EdificacionService) {}

  @Post()
  create(@Body() createEdificacionDto: CreateEdificacionDto) {
    return this.edificacionService.create(createEdificacionDto);
  }

  @Get()
  findAll() {
    return this.edificacionService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.edificacionService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEdificacionDto: UpdateEdificacionDto) {
    return this.edificacionService.update(+id, updateEdificacionDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.edificacionService.remove(+id);
  }
}
