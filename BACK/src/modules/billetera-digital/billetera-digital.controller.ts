import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BilleteraDigitalService } from './billetera-digital.service';
import { CreateBilleteraDigitalDto } from './dto/create-billetera-digital.dto';
import { UpdateBilleteraDigitalDto } from './dto/update-billetera-digital.dto';

@Controller('billetera-digital')
export class BilleteraDigitalController {
  constructor(private readonly billeteraDigitalService: BilleteraDigitalService) {}

  @Post()
  create(@Body() createBilleteraDigitalDto: CreateBilleteraDigitalDto) {
    return this.billeteraDigitalService.create(createBilleteraDigitalDto);
  }

  @Get()
  findAll() {
    return this.billeteraDigitalService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.billeteraDigitalService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateBilleteraDigitalDto: UpdateBilleteraDigitalDto) {
    return this.billeteraDigitalService.update(+id, updateBilleteraDigitalDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.billeteraDigitalService.remove(+id);
  }
}
