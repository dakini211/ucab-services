import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FolioService } from './folio.service';
import { CreateFolioDto } from './dto/create-folio.dto';
import { UpdateFolioDto } from './dto/update-folio.dto';

@Controller('folio')
export class FolioController {
  constructor(private readonly folioService: FolioService) {}

  @Post()
  create(@Body() createFolioDto: CreateFolioDto) {
    return this.folioService.create(createFolioDto);
  }

  @Get()
  findAll() {
    return this.folioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.folioService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFolioDto: UpdateFolioDto) {
    return this.folioService.update(+id, updateFolioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.folioService.remove(+id);
  }
}
