import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ItemsConsumoService } from './items-consumo.service';
import { CreateItemsConsumoDto } from './dto/create-items-consumo.dto';
import { UpdateItemsConsumoDto } from './dto/update-items-consumo.dto';

@Controller('items-consumo')
export class ItemsConsumoController {
  constructor(private readonly itemsConsumoService: ItemsConsumoService) {}

  @Post()
  create(@Body() createItemsConsumoDto: CreateItemsConsumoDto) {
    return this.itemsConsumoService.create(createItemsConsumoDto);
  }

  @Get()
  findAll() {
    return this.itemsConsumoService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.itemsConsumoService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateItemsConsumoDto: UpdateItemsConsumoDto) {
    return this.itemsConsumoService.update(+id, updateItemsConsumoDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.itemsConsumoService.remove(+id);
  }
}
