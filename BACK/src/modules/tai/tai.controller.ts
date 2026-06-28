import { Controller, Get, Post, Body, Patch, Delete } from '@nestjs/common';
import { TaiService } from './tai.service';
import { CreateTaiDto } from './dto/create-tai.dto';
import { UpdateTaiDto } from './dto/update-tai.dto';

@Controller('tai')
export class TaiController {
  constructor(private readonly taiService: TaiService) {}

  @Post()
  create(@Body() createDto: CreateTaiDto) {
    return this.taiService.create(createDto);
  }

  @Get()
  findAll() {
    return this.taiService.findAll();
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('find')
  findOne(@Body() keys: any) {
    return this.taiService.findOne(keys);
  }

  /** PK compuesta → { keys: {...}, data: {...} } */
  @Patch()
  update(@Body() body: { keys: any; data: UpdateTaiDto }) {
    return this.taiService.update(body.keys, body.data);
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('delete')
  remove(@Body() keys: any) {
    return this.taiService.remove(keys);
  }
}
