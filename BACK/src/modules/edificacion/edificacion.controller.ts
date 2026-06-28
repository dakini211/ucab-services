import { Controller, Get, Post, Body, Patch, Delete } from '@nestjs/common';
import { EdificacionService } from './edificacion.service';
import { CreateEdificacionDto } from './dto/create-edificacion.dto';
import { UpdateEdificacionDto } from './dto/update-edificacion.dto';

@Controller('edificacion')
export class EdificacionController {
  constructor(private readonly edificacionService: EdificacionService) {}

  @Post()
  create(@Body() createDto: CreateEdificacionDto) {
    return this.edificacionService.create(createDto);
  }

  @Get()
  findAll() {
    return this.edificacionService.findAll();
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('find')
  findOne(@Body() keys: any) {
    return this.edificacionService.findOne(keys);
  }

  /** PK compuesta → { keys: {...}, data: {...} } */
  @Patch()
  update(@Body() body: { keys: any; data: UpdateEdificacionDto }) {
    return this.edificacionService.update(body.keys, body.data);
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('delete')
  remove(@Body() keys: any) {
    return this.edificacionService.remove(keys);
  }
}
