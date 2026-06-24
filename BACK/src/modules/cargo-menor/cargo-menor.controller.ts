import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CargoMenorService } from './cargo-menor.service';
import { CreateCargoMenorDto } from './dto/create-cargo-menor.dto';
import { UpdateCargoMenorDto } from './dto/update-cargo-menor.dto';

@Controller('cargo-menor')
export class CargoMenorController {
  constructor(private readonly cargoMenorService: CargoMenorService) {}

  @Post()
  create(@Body() createCargoMenorDto: CreateCargoMenorDto) {
    return this.cargoMenorService.create(createCargoMenorDto);
  }

  @Get()
  findAll() {
    return this.cargoMenorService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.cargoMenorService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCargoMenorDto: UpdateCargoMenorDto) {
    return this.cargoMenorService.update(+id, updateCargoMenorDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.cargoMenorService.remove(+id);
  }
}
