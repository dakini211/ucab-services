import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe } from '@nestjs/common';
import { FamiliarService } from './familiar.service';
import { CreateFamiliarDto } from './dto/create-familiar.dto';
import { UpdateFamiliarDto } from './dto/update-familiar.dto';

@Controller('familiar')
export class FamiliarController {
  constructor(private readonly familiarService: FamiliarService) {}

  @Post()
  create(@Body() createFamiliarDto: CreateFamiliarDto) {
    return this.familiarService.create(createFamiliarDto);
  }

  @Get()
  findAll() {
    return this.familiarService.findAll();
  }

  @Get(':cedula')
  findOne(@Param('cedula', ParseIntPipe) cedula: number) {
    return this.familiarService.findOne(cedula);
  }

  @Patch(':cedula')
  update(@Param('cedula', ParseIntPipe) cedula: number, @Body() updateFamiliarDto: UpdateFamiliarDto) {
    return this.familiarService.update(cedula, updateFamiliarDto);
  }

  @Delete(':cedula')
  remove(@Param('cedula', ParseIntPipe) cedula: number) {
    return this.familiarService.remove(cedula);
  }
}
