import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PersonalUcabService } from './personal-ucab.service';
import { CreatePersonalUcabDto } from './dto/create-personal-ucab.dto';
import { UpdatePersonalUcabDto } from './dto/update-personal-ucab.dto';

@Controller('personal-ucab')
export class PersonalUcabController {
  constructor(private readonly personalUcabService: PersonalUcabService) {}

  @Post()
  create(@Body() createDto: CreatePersonalUcabDto) {
    return this.personalUcabService.create(createDto);
  }

  @Get()
  findAll() {
    return this.personalUcabService.findAll();
  }

  @Get(':id_miembro')
  findOne(@Param('id_miembro') id_miembro: string) {
    return this.personalUcabService.findOne(id_miembro);
  }

  @Patch(':id_miembro')
  update(@Param('id_miembro') id_miembro: string, @Body() updateDto: UpdatePersonalUcabDto) {
    return this.personalUcabService.update(id_miembro, updateDto);
  }

  @Delete(':id_miembro')
  remove(@Param('id_miembro') id_miembro: string) {
    return this.personalUcabService.remove(id_miembro);
  }
}
