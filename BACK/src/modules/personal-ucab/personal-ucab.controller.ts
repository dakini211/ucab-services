import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PersonalUcabService } from './personal-ucab.service';
import { CreatePersonalUcabDto } from './dto/create-personal-ucab.dto';
import { UpdatePersonalUcabDto } from './dto/update-personal-ucab.dto';

@Controller('personal-ucab')
export class PersonalUcabController {
  constructor(private readonly personalUcabService: PersonalUcabService) {}

  @Post()
  create(@Body() createPersonalUcabDto: CreatePersonalUcabDto) {
    return this.personalUcabService.create(createPersonalUcabDto);
  }

  @Get()
  findAll() {
    return this.personalUcabService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.personalUcabService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePersonalUcabDto: UpdatePersonalUcabDto) {
    return this.personalUcabService.update(+id, updatePersonalUcabDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.personalUcabService.remove(+id);
  }
}
