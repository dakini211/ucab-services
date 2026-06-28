import { Controller, Get, Post, Body, Patch, Delete } from '@nestjs/common';
import { RecursoTecnologicosService } from './recurso-tecnologicos.service';
import { CreateRecursoTecnologicosDto } from './dto/create-recurso-tecnologicos.dto';
import { UpdateRecursoTecnologicosDto } from './dto/update-recurso-tecnologicos.dto';

@Controller('recurso-tecnologicos')
export class RecursoTecnologicosController {
  constructor(private readonly recursoTecnologicosService: RecursoTecnologicosService) {}

  @Post()
  create(@Body() createDto: CreateRecursoTecnologicosDto) {
    return this.recursoTecnologicosService.create(createDto);
  }

  @Get()
  findAll() {
    return this.recursoTecnologicosService.findAll();
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('find')
  findOne(@Body() keys: any) {
    return this.recursoTecnologicosService.findOne(keys);
  }

  /** PK compuesta → { keys: {...}, data: {...} } */
  @Patch()
  update(@Body() body: { keys: any; data: UpdateRecursoTecnologicosDto }) {
    return this.recursoTecnologicosService.update(body.keys, body.data);
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('delete')
  remove(@Body() keys: any) {
    return this.recursoTecnologicosService.remove(keys);
  }
}
