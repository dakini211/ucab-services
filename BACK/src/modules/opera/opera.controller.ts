import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { OperaService } from './opera.service';
import { CreateOperaDto } from './dto/create-opera.dto';
import { UpdateOperaDto } from './dto/update-opera.dto';

@Controller('opera')
export class OperaController {
  constructor(private readonly operaService: OperaService) {}

  @Post()
  create(@Body() createOperaDto: CreateOperaDto) {
    return this.operaService.create(createOperaDto);
  }

  @Get()
  findAll() {
    return this.operaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.operaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateOperaDto: UpdateOperaDto) {
    return this.operaService.update(+id, updateOperaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.operaService.remove(+id);
  }
}
