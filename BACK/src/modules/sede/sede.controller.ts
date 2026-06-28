import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { SedeService } from './sede.service';
import { CreateSedeDto } from './dto/create-sede.dto';
import { UpdateSedeDto } from './dto/update-sede.dto';

@Controller('sede')
export class SedeController {
  constructor(private readonly sedeService: SedeService) {}

  @Post()
  create(@Body() createSedeDto: CreateSedeDto) {
    return this.sedeService.create(createSedeDto);
  }

  @Get()
  findAll() {
    return this.sedeService.findAll();
  }

  @Get(':nombre_sede')
  findOne(@Param('nombre_sede') nombre_sede: string) {
    return this.sedeService.findOne(nombre_sede);
  }

  @Patch(':nombre_sede')
  update(@Param('nombre_sede') nombre_sede: string, @Body() updateSedeDto: UpdateSedeDto) {
    return this.sedeService.update(nombre_sede, updateSedeDto);
  }

  @Delete(':nombre_sede')
  remove(@Param('nombre_sede') nombre_sede: string) {
    return this.sedeService.remove(nombre_sede);
  }
}
