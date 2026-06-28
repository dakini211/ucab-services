import { Controller, Get, Post, Body, Patch, Delete } from '@nestjs/common';
import { EspacioFisicoService } from './espacio-fisico.service';
import { CreateEspacioFisicoDto } from './dto/create-espacio-fisico.dto';
import { UpdateEspacioFisicoDto } from './dto/update-espacio-fisico.dto';

@Controller('espacio-fisico')
export class EspacioFisicoController {
  constructor(private readonly espacioFisicoService: EspacioFisicoService) {}

  @Post()
  create(@Body() createDto: CreateEspacioFisicoDto) {
    return this.espacioFisicoService.create(createDto);
  }

  @Get()
  findAll() {
    return this.espacioFisicoService.findAll();
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('find')
  findOne(@Body() keys: any) {
    return this.espacioFisicoService.findOne(keys);
  }

  /** PK compuesta → { keys: {...}, data: {...} } */
  @Patch()
  update(@Body() body: { keys: any; data: UpdateEspacioFisicoDto }) {
    return this.espacioFisicoService.update(body.keys, body.data);
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('delete')
  remove(@Body() keys: any) {
    return this.espacioFisicoService.remove(keys);
  }
}
