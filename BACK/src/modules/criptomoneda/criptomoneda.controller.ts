import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CriptomonedaService } from './criptomoneda.service';
import { CreateCriptomonedaDto } from './dto/create-criptomoneda.dto';
import { UpdateCriptomonedaDto } from './dto/update-criptomoneda.dto';

@Controller('criptomoneda')
export class CriptomonedaController {
  constructor(private readonly criptomonedaService: CriptomonedaService) {}

  @Post()
  create(@Body() createCriptomonedaDto: CreateCriptomonedaDto) {
    return this.criptomonedaService.create(createCriptomonedaDto);
  }

  @Get()
  findAll() {
    return this.criptomonedaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.criptomonedaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCriptomonedaDto: UpdateCriptomonedaDto) {
    return this.criptomonedaService.update(+id, updateCriptomonedaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.criptomonedaService.remove(+id);
  }
}
