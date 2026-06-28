import { Controller, Get, Post, Body, Patch, Delete } from '@nestjs/common';
import { EfectivoService } from './efectivo.service';
import { CreateEfectivoDto } from './dto/create-efectivo.dto';
import { UpdateEfectivoDto } from './dto/update-efectivo.dto';

@Controller('efectivo')
export class EfectivoController {
  constructor(private readonly efectivoService: EfectivoService) {}

  @Post()
  create(@Body() createDto: CreateEfectivoDto) {
    return this.efectivoService.create(createDto);
  }

  @Get()
  findAll() {
    return this.efectivoService.findAll();
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('find')
  findOne(@Body() keys: any) {
    return this.efectivoService.findOne(keys);
  }

  /** PK compuesta → { keys: {...}, data: {...} } */
  @Patch()
  update(@Body() body: { keys: any; data: UpdateEfectivoDto }) {
    return this.efectivoService.update(body.keys, body.data);
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('delete')
  remove(@Body() keys: any) {
    return this.efectivoService.remove(keys);
  }
}
