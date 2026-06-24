import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
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

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.familiarService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateFamiliarDto: UpdateFamiliarDto) {
    return this.familiarService.update(+id, updateFamiliarDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.familiarService.remove(+id);
  }
}
