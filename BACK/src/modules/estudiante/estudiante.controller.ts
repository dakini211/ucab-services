import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EstudianteService } from './estudiante.service';
import { CreateEstudianteDto } from './dto/create-estudiante.dto';
import { UpdateEstudianteDto } from './dto/update-estudiante.dto';

@Controller('estudiante')
export class EstudianteController {
  constructor(private readonly estudianteService: EstudianteService) {}

  @Post()
  create(@Body() createDto: CreateEstudianteDto) {
    return this.estudianteService.create(createDto);
  }

  @Get()
  findAll() {
    return this.estudianteService.findAll();
  }

  @Get(':id_miembro')
  findOne(@Param('id_miembro') id_miembro: string) {
    return this.estudianteService.findOne(id_miembro);
  }

  @Patch(':id_miembro')
  update(@Param('id_miembro') id_miembro: string, @Body() updateDto: UpdateEstudianteDto) {
    return this.estudianteService.update(id_miembro, updateDto);
  }

  @Delete(':id_miembro')
  remove(@Param('id_miembro') id_miembro: string) {
    return this.estudianteService.remove(id_miembro);
  }
}
