import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EfectivoService } from './efectivo.service';
import { CreateEfectivoDto } from './dto/create-efectivo.dto';
import { UpdateEfectivoDto } from './dto/update-efectivo.dto';

@Controller('efectivo')
export class EfectivoController {
  constructor(private readonly efectivoService: EfectivoService) {}

  @Post()
  create(@Body() createEfectivoDto: CreateEfectivoDto) {
    return this.efectivoService.create(createEfectivoDto);
  }

  @Get()
  findAll() {
    return this.efectivoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.efectivoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateEfectivoDto: UpdateEfectivoDto) {
    return this.efectivoService.update(+id, updateEfectivoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.efectivoService.remove(+id);
  }
}
