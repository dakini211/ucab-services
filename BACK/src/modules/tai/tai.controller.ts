import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { TaiService } from './tai.service';
import { CreateTaiDto } from './dto/create-tai.dto';
import { UpdateTaiDto } from './dto/update-tai.dto';

@Controller('tai')
export class TaiController {
  constructor(private readonly taiService: TaiService) {}

  @Post()
  create(@Body() createTaiDto: CreateTaiDto) {
    return this.taiService.create(createTaiDto);
  }

  @Get()
  findAll() {
    return this.taiService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.taiService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateTaiDto: UpdateTaiDto) {
    return this.taiService.update(+id, updateTaiDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.taiService.remove(+id);
  }
}
