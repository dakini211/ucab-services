import { Controller, Get, Post, Body, Patch, Delete } from '@nestjs/common';
import { AcompananteService } from './acompanante.service';
import { CreateAcompananteDto } from './dto/create-acompanante.dto';
import { UpdateAcompananteDto } from './dto/update-acompanante.dto';

@Controller('acompanante')
export class AcompananteController {
  constructor(private readonly acompananteService: AcompananteService) {}

  @Post()
  create(@Body() createDto: CreateAcompananteDto) {
    return this.acompananteService.create(createDto);
  }

  @Get()
  findAll() {
    return this.acompananteService.findAll();
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('find')
  findOne(@Body() keys: any) {
    return this.acompananteService.findOne(keys);
  }

  /** PK compuesta → { keys: {...}, data: {...} } */
  @Patch()
  update(@Body() body: { keys: any; data: UpdateAcompananteDto }) {
    return this.acompananteService.update(body.keys, body.data);
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('delete')
  remove(@Body() keys: any) {
    return this.acompananteService.remove(keys);
  }
}
