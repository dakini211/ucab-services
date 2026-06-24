import { Module } from '@nestjs/common';
import { RecursoTecnologicosService } from './recurso-tecnologicos.service';
import { RecursoTecnologicosController } from './recurso-tecnologicos.controller';

@Module({
  controllers: [RecursoTecnologicosController],
  providers: [RecursoTecnologicosService],
})
export class RecursoTecnologicosModule {}
