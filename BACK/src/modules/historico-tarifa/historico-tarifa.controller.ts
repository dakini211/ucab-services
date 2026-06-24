import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { HistoricoTarifaService } from './historico-tarifa.service';
import { CreateHistoricoTarifaDto } from './dto/create-historico-tarifa.dto';
import { UpdateHistoricoTarifaDto } from './dto/update-historico-tarifa.dto';

@Controller('historico-tarifa')
export class HistoricoTarifaController {
  constructor(private readonly historicoTarifaService: HistoricoTarifaService) {}

  @Post()
  create(@Body() createHistoricoTarifaDto: CreateHistoricoTarifaDto) {
    return this.historicoTarifaService.create(createHistoricoTarifaDto);
  }

  @Get()
  findAll() {
    return this.historicoTarifaService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.historicoTarifaService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateHistoricoTarifaDto: UpdateHistoricoTarifaDto) {
    return this.historicoTarifaService.update(+id, updateHistoricoTarifaDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.historicoTarifaService.remove(+id);
  }
}
