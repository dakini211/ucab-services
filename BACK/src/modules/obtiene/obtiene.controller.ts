import { Controller, Get, Post, Body, Patch, Delete } from '@nestjs/common';
import { ObtieneService } from './obtiene.service';
import { CreateObtieneDto } from './dto/create-obtiene.dto';
import { UpdateObtieneDto } from './dto/update-obtiene.dto';

@Controller('obtiene')
export class ObtieneController {
  constructor(private readonly obtieneService: ObtieneService) {}

  @Post()
  create(@Body() createDto: CreateObtieneDto) {
    return this.obtieneService.create(createDto);
  }

  @Get()
  findAll() {
    return this.obtieneService.findAll();
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('find')
  findOne(@Body() keys: any) {
    return this.obtieneService.findOne(keys);
  }

  /** PK compuesta → { keys: {...}, data: {...} } */
  @Patch()
  update(@Body() body: { keys: any; data: UpdateObtieneDto }) {
    return this.obtieneService.update(body.keys, body.data);
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('delete')
  remove(@Body() keys: any) {
    return this.obtieneService.remove(keys);
  }
}
