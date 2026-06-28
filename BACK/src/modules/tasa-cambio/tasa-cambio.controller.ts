import { Controller, Get, Post, Body, Patch, Delete } from '@nestjs/common';
import { TasaCambioService } from './tasa-cambio.service';
import { CreateTasaCambioDto } from './dto/create-tasa-cambio.dto';
import { UpdateTasaCambioDto } from './dto/update-tasa-cambio.dto';

@Controller('tasa-cambio')
export class TasaCambioController {
  constructor(private readonly tasaCambioService: TasaCambioService) {}

  @Post()
  create(@Body() createDto: CreateTasaCambioDto) {
    return this.tasaCambioService.create(createDto);
  }

  @Get()
  findAll() {
    return this.tasaCambioService.findAll();
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('find')
  findOne(@Body() keys: any) {
    return this.tasaCambioService.findOne(keys);
  }

  /** PK compuesta → { keys: {...}, data: {...} } */
  @Patch()
  update(@Body() body: { keys: any; data: UpdateTasaCambioDto }) {
    return this.tasaCambioService.update(body.keys, body.data);
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('delete')
  remove(@Body() keys: any) {
    return this.tasaCambioService.remove(keys);
  }
}
