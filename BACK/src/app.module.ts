import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { SedesModule } from './modules/sedes/sedes.module';
import { EntidadesModule } from './modules/entidades/entidades.module';
import { OfertasLaboralesModule } from './modules/ofertas-laborales/ofertas-laborales.module';
import { MiembroModule } from './modules/miembro/miembro.module';

@Module({
  imports: [PrismaModule, SedesModule, EntidadesModule, OfertasLaboralesModule, MiembroModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
