import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { AcompananteService } from './acompanante.service';
import { CreateAcompananteDto } from './dto/create-acompanante.dto';
import { UpdateAcompananteDto } from './dto/update-acompanante.dto';

@Controller('acompanante')
export class AcompananteController {
  constructor(private readonly acompananteService: AcompananteService) {}

  @Post()
  create(@Body() createAcompananteDto: CreateAcompananteDto) {
    return this.acompananteService.create(createAcompananteDto);
  }

  @Get()
  findAll() {
    return this.acompananteService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.acompananteService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateAcompananteDto: UpdateAcompananteDto) {
    return this.acompananteService.update(+id, updateAcompananteDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.acompananteService.remove(+id);
  }
}
