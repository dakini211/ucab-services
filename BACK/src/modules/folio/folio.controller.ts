import { Controller, Get, Post, Body, Patch, Delete } from '@nestjs/common';
import { FolioService } from './folio.service';
import { CreateFolioDto } from './dto/create-folio.dto';
import { UpdateFolioDto } from './dto/update-folio.dto';

@Controller('folio')
export class FolioController {
  constructor(private readonly folioService: FolioService) {}

  @Post()
  create(@Body() createDto: CreateFolioDto) {
    return this.folioService.create(createDto);
  }

  @Get()
  findAll() {
    return this.folioService.findAll();
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('find')
  findOne(@Body() keys: any) {
    return this.folioService.findOne(keys);
  }

  /** PK compuesta → { keys: {...}, data: {...} } */
  @Patch()
  update(@Body() body: { keys: any; data: UpdateFolioDto }) {
    return this.folioService.update(body.keys, body.data);
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('delete')
  remove(@Body() keys: any) {
    return this.folioService.remove(keys);
  }
}
