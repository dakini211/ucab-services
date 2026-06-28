import { Controller, Get, Post, Body, Patch, Delete } from '@nestjs/common';
import { ItemsConsumoService } from './items-consumo.service';
import { CreateItemsConsumoDto } from './dto/create-items-consumo.dto';
import { UpdateItemsConsumoDto } from './dto/update-items-consumo.dto';

@Controller('items-consumo')
export class ItemsConsumoController {
  constructor(private readonly itemsConsumoService: ItemsConsumoService) {}

  @Post()
  create(@Body() createDto: CreateItemsConsumoDto) {
    return this.itemsConsumoService.create(createDto);
  }

  @Get()
  findAll() {
    return this.itemsConsumoService.findAll();
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('find')
  findOne(@Body() keys: any) {
    return this.itemsConsumoService.findOne(keys);
  }

  /** PK compuesta → { keys: {...}, data: {...} } */
  @Patch()
  update(@Body() body: { keys: any; data: UpdateItemsConsumoDto }) {
    return this.itemsConsumoService.update(body.keys, body.data);
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('delete')
  remove(@Body() keys: any) {
    return this.itemsConsumoService.remove(keys);
  }
}
