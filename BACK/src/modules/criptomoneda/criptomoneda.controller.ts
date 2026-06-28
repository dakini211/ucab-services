import { Controller, Get, Post, Body, Patch, Delete } from '@nestjs/common';
import { CriptomonedaService } from './criptomoneda.service';
import { CreateCriptomonedaDto } from './dto/create-criptomoneda.dto';
import { UpdateCriptomonedaDto } from './dto/update-criptomoneda.dto';

@Controller('criptomoneda')
export class CriptomonedaController {
  constructor(private readonly criptomonedaService: CriptomonedaService) {}

  @Post()
  create(@Body() createDto: CreateCriptomonedaDto) {
    return this.criptomonedaService.create(createDto);
  }

  @Get()
  findAll() {
    return this.criptomonedaService.findAll();
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('find')
  findOne(@Body() keys: any) {
    return this.criptomonedaService.findOne(keys);
  }

  /** PK compuesta → { keys: {...}, data: {...} } */
  @Patch()
  update(@Body() body: { keys: any; data: UpdateCriptomonedaDto }) {
    return this.criptomonedaService.update(body.keys, body.data);
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('delete')
  remove(@Body() keys: any) {
    return this.criptomonedaService.remove(keys);
  }
}
