import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ObtieneService } from './obtiene.service';
import { CreateObtieneDto } from './dto/create-obtiene.dto';
import { UpdateObtieneDto } from './dto/update-obtiene.dto';

@Controller('obtiene')
export class ObtieneController {
  constructor(private readonly obtieneService: ObtieneService) {}

  @Post()
  create(@Body() createObtieneDto: CreateObtieneDto) {
    return this.obtieneService.create(createObtieneDto);
  }

  @Get()
  findAll() {
    return this.obtieneService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.obtieneService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateObtieneDto: UpdateObtieneDto) {
    return this.obtieneService.update(+id, updateObtieneDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.obtieneService.remove(+id);
  }
}
