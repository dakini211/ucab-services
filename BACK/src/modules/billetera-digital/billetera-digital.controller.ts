import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BilleteraDigitalService } from './billetera-digital.service';
import { CreateBilleteraDigitalDto } from './dto/create-billetera-digital.dto';
import { UpdateBilleteraDigitalDto } from './dto/update-billetera-digital.dto';

@Controller('billetera-digital')
export class BilleteraDigitalController {
  constructor(private readonly billeteraDigitalService: BilleteraDigitalService) {}

  @Post()
  create(@Body() createDto: CreateBilleteraDigitalDto) {
    return this.billeteraDigitalService.create(createDto);
  }

  @Get()
  findAll() {
    return this.billeteraDigitalService.findAll();
  }

  @Get(':uid')
  findOne(@Param('uid') uid: string) {
    return this.billeteraDigitalService.findOne(uid);
  }

  @Patch(':uid')
  update(@Param('uid') uid: string, @Body() updateDto: UpdateBilleteraDigitalDto) {
    return this.billeteraDigitalService.update(uid, updateDto);
  }

  @Delete(':uid')
  remove(@Param('uid') uid: string) {
    return this.billeteraDigitalService.remove(uid);
  }
}
