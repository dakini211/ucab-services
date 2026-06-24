import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PagoMovilService } from './pago-movil.service';
import { CreatePagoMovilDto } from './dto/create-pago-movil.dto';
import { UpdatePagoMovilDto } from './dto/update-pago-movil.dto';

@Controller('pago-movil')
export class PagoMovilController {
  constructor(private readonly pagoMovilService: PagoMovilService) {}

  @Post()
  create(@Body() createPagoMovilDto: CreatePagoMovilDto) {
    return this.pagoMovilService.create(createPagoMovilDto);
  }

  @Get()
  findAll() {
    return this.pagoMovilService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.pagoMovilService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePagoMovilDto: UpdatePagoMovilDto) {
    return this.pagoMovilService.update(+id, updatePagoMovilDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.pagoMovilService.remove(+id);
  }
}
