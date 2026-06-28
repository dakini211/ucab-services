import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CargoMayorService } from './cargo-mayor.service';
import { CreateCargoMayorDto } from './dto/create-cargo-mayor.dto';
import { UpdateCargoMayorDto } from './dto/update-cargo-mayor.dto';

@Controller('cargo-mayor')
export class CargoMayorController {
  constructor(private readonly cargoMayorService: CargoMayorService) {}

  @Post()
  create(@Body() createDto: CreateCargoMayorDto) {
    return this.cargoMayorService.create(createDto);
  }

  @Get()
  findAll() {
    return this.cargoMayorService.findAll();
  }

  @Get(':cedula')
  findOne(@Param('cedula') cedula: string) {
    return this.cargoMayorService.findOne(+cedula);
  }

  @Patch(':cedula')
  update(@Param('cedula') cedula: string, @Body() updateDto: UpdateCargoMayorDto) {
    return this.cargoMayorService.update(+cedula, updateDto);
  }

  @Delete(':cedula')
  remove(@Param('cedula') cedula: string) {
    return this.cargoMayorService.remove(+cedula);
  }
}
