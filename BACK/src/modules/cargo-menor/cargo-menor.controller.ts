import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CargoMenorService } from './cargo-menor.service';
import { CreateCargoMenorDto } from './dto/create-cargo-menor.dto';
import { UpdateCargoMenorDto } from './dto/update-cargo-menor.dto';

@Controller('cargo-menor')
export class CargoMenorController {
  constructor(private readonly cargoMenorService: CargoMenorService) {}

  @Post()
  create(@Body() createDto: CreateCargoMenorDto) {
    return this.cargoMenorService.create(createDto);
  }

  @Get()
  findAll() {
    return this.cargoMenorService.findAll();
  }

  @Get(':cedula')
  findOne(@Param('cedula') cedula: string) {
    return this.cargoMenorService.findOne(+cedula);
  }

  @Patch(':cedula')
  update(@Param('cedula') cedula: string, @Body() updateDto: UpdateCargoMenorDto) {
    return this.cargoMenorService.update(+cedula, updateDto);
  }

  @Delete(':cedula')
  remove(@Param('cedula') cedula: string) {
    return this.cargoMenorService.remove(+cedula);
  }
}
