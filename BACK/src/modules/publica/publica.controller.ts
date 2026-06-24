import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PublicaService } from './publica.service';
import { CreatePublicaDto } from './dto/create-publica.dto';
import { UpdatePublicaDto } from './dto/update-publica.dto';

@Controller('publica')
export class PublicaController {
  constructor(private readonly publicaService: PublicaService) {}

  @Post()
  create(@Body() createPublicaDto: CreatePublicaDto) {
    return this.publicaService.create(createPublicaDto);
  }

  @Get()
  findAll() {
    return this.publicaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.publicaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePublicaDto: UpdatePublicaDto) {
    return this.publicaService.update(+id, updatePublicaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.publicaService.remove(+id);
  }
}
