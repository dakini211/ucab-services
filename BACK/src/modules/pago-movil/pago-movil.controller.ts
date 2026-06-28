import { Controller, Get, Post, Body, Patch, Delete } from '@nestjs/common';
import { PagoMovilService } from './pago-movil.service';
import { CreatePagoMovilDto } from './dto/create-pago-movil.dto';
import { UpdatePagoMovilDto } from './dto/update-pago-movil.dto';

@Controller('pago-movil')
export class PagoMovilController {
  constructor(private readonly pagoMovilService: PagoMovilService) {}

  @Post()
  create(@Body() createDto: CreatePagoMovilDto) {
    return this.pagoMovilService.create(createDto);
  }

  @Get()
  findAll() {
    return this.pagoMovilService.findAll();
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('find')
  findOne(@Body() keys: any) {
    return this.pagoMovilService.findOne(keys);
  }

  /** PK compuesta → { keys: {...}, data: {...} } */
  @Patch()
  update(@Body() body: { keys: any; data: UpdatePagoMovilDto }) {
    return this.pagoMovilService.update(body.keys, body.data);
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('delete')
  remove(@Body() keys: any) {
    return this.pagoMovilService.remove(keys);
  }
}
