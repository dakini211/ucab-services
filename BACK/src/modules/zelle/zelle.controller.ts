import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ZelleService } from './zelle.service';
import { CreateZelleDto } from './dto/create-zelle.dto';
import { UpdateZelleDto } from './dto/update-zelle.dto';

@Controller('zelle')
export class ZelleController {
  constructor(private readonly zelleService: ZelleService) {}

  @Post()
  create(@Body() createZelleDto: CreateZelleDto) {
    return this.zelleService.create(createZelleDto);
  }

  @Get()
  findAll() {
    return this.zelleService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.zelleService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateZelleDto: UpdateZelleDto) {
    return this.zelleService.update(+id, updateZelleDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.zelleService.remove(+id);
  }
}
