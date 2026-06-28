import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { FacturaService } from './factura.service';
import { CreateFacturaDto } from './dto/create-factura.dto';
import { UpdateFacturaDto } from './dto/update-factura.dto';

@Controller('factura')
export class FacturaController {
  constructor(private readonly facturaService: FacturaService) {}

  @Post()
  create(@Body() createFacturaDto: CreateFacturaDto) {
    return this.facturaService.create(createFacturaDto);
  }

  @Get()
  findAll() {
    return this.facturaService.findAll();
  }

  @Get(':numero_de_control')
  findOne(@Param('numero_de_control') numero_de_control: string) {
    return this.facturaService.findOne(numero_de_control);
  }

  @Patch(':numero_de_control')
  update(@Param('numero_de_control') numero_de_control: string, @Body() updateFacturaDto: UpdateFacturaDto) {
    return this.facturaService.update(numero_de_control, updateFacturaDto);
  }

  @Delete(':numero_de_control')
  remove(@Param('numero_de_control') numero_de_control: string) {
    return this.facturaService.remove(numero_de_control);
  }
}
