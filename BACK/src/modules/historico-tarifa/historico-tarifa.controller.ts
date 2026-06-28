import { Controller, Get, Post, Body, Patch, Delete } from '@nestjs/common';
import { HistoricoTarifaService } from './historico-tarifa.service';
import { CreateHistoricoTarifaDto } from './dto/create-historico-tarifa.dto';
import { UpdateHistoricoTarifaDto } from './dto/update-historico-tarifa.dto';

@Controller('historico-tarifa')
export class HistoricoTarifaController {
  constructor(private readonly historicoTarifaService: HistoricoTarifaService) {}

  @Post()
  create(@Body() createDto: CreateHistoricoTarifaDto) {
    return this.historicoTarifaService.create(createDto);
  }

  @Get()
  findAll() {
    return this.historicoTarifaService.findAll();
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('find')
  findOne(@Body() keys: any) {
    return this.historicoTarifaService.findOne(keys);
  }

  /** PK compuesta → { keys: {...}, data: {...} } */
  @Patch()
  update(@Body() body: { keys: any; data: UpdateHistoricoTarifaDto }) {
    return this.historicoTarifaService.update(body.keys, body.data);
  }

  /** PK compuesta → recibe los campos clave en el body */
  @Post('delete')
  remove(@Body() keys: any) {
    return this.historicoTarifaService.remove(keys);
  }
}
