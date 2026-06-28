import { Controller, Get, Post, Body, Patch, Delete } from '@nestjs/common';
import { ZelleService } from './zelle.service';
import { CreateZelleDto } from './dto/create-zelle.dto';
import { UpdateZelleDto } from './dto/update-zelle.dto';

@Controller('zelle')
export class ZelleController {
  constructor(private readonly zelleService: ZelleService) {}

  @Post()
  create(@Body() createDto: CreateZelleDto) {
    return this.zelleService.create(createDto);
  }

  @Get()
  findAll() {
    return this.zelleService.findAll();
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('find')
  findOne(@Body() keys: any) {
    return this.zelleService.findOne(keys);
  }

  /** PK compuesta → { keys: {...}, data: {...} } */
  @Patch()
  update(@Body() body: { keys: any; data: UpdateZelleDto }) {
    return this.zelleService.update(body.keys, body.data);
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('delete')
  remove(@Body() keys: any) {
    return this.zelleService.remove(keys);
  }
}
