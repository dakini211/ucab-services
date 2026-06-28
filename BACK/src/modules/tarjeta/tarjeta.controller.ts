import { Controller, Get, Post, Body, Patch, Delete } from '@nestjs/common';
import { TarjetaService } from './tarjeta.service';
import { CreateTarjetaDto } from './dto/create-tarjeta.dto';
import { UpdateTarjetaDto } from './dto/update-tarjeta.dto';

@Controller('tarjeta')
export class TarjetaController {
  constructor(private readonly tarjetaService: TarjetaService) {}

  @Post()
  create(@Body() createDto: CreateTarjetaDto) {
    return this.tarjetaService.create(createDto);
  }

  @Get()
  findAll() {
    return this.tarjetaService.findAll();
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('find')
  findOne(@Body() keys: any) {
    return this.tarjetaService.findOne(keys);
  }

  /** PK compuesta → { keys: {...}, data: {...} } */
  @Patch()
  update(@Body() body: { keys: any; data: UpdateTarjetaDto }) {
    return this.tarjetaService.update(body.keys, body.data);
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('delete')
  remove(@Body() keys: any) {
    return this.tarjetaService.remove(keys);
  }
}
