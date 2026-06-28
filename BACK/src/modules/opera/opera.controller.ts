import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OperaService } from './opera.service';
import { CreateOperaDto } from './dto/create-opera.dto';
import { UpdateOperaDto } from './dto/update-opera.dto';

@Controller('opera')
export class OperaController {
  constructor(private readonly operaService: OperaService) {}

  @Post()
  create(@Body() createOperaDto: CreateOperaDto) {
    return this.operaService.create(createOperaDto);
  }

  @Get()
  findAll() {
    return this.operaService.findAll();
  }

  @Get(':nombre_entidad')
  findOne(@Param('nombre_entidad') nombre_entidad: string) {
    return this.operaService.findOne(nombre_entidad);
  }

  @Patch(':nombre_entidad')
  update(@Param('nombre_entidad') nombre_entidad: string, @Body() updateOperaDto: UpdateOperaDto) {
    return this.operaService.update(nombre_entidad, updateOperaDto);
  }

  @Delete(':nombre_entidad')
  remove(@Param('nombre_entidad') nombre_entidad: string) {
    return this.operaService.remove(nombre_entidad);
  }
}
