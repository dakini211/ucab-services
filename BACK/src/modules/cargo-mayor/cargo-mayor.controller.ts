import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CargoMayorService } from './cargo-mayor.service';
import { CreateCargoMayorDto } from './dto/create-cargo-mayor.dto';
import { UpdateCargoMayorDto } from './dto/update-cargo-mayor.dto';

@Controller('cargo-mayor')
export class CargoMayorController {
  constructor(private readonly cargoMayorService: CargoMayorService) {}

  @Post()
  create(@Body() createCargoMayorDto: CreateCargoMayorDto) {
    return this.cargoMayorService.create(createCargoMayorDto);
  }

  @Get()
  findAll() {
    return this.cargoMayorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cargoMayorService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCargoMayorDto: UpdateCargoMayorDto) {
    return this.cargoMayorService.update(+id, updateCargoMayorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cargoMayorService.remove(+id);
  }
}
