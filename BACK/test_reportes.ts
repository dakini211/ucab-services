import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { ReportesService } from './src/modules/reportes/reportes.service';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const service = app.get(ReportesService);
  try {
    const res = await service.getResumenCompleto();
    console.log("Success", res);
  } catch (err) {
    console.error("ERROR IN RESUMEN:");
    console.error(err);
  }
  await app.close();
}
bootstrap();
