import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { PrismaExceptionFilter } from './common/filters/prisma-exception.filter';

// Parche para que BigInt pueda ser convertido a JSON por express/NestJS
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix('api');

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  // ── AÑADIDO ────────────────────────────────────────────────────────────────
  // Sin este filtro, los RAISE EXCEPTION de PL/pgSQL llegan al usuario como un
  // 500 generico: Prisma envuelve los errores de PostgreSQL en P2010 y esconde
  // el SQLSTATE en meta.code. El filtro los desempaqueta y los traduce.
  app.useGlobalFilters(new PrismaExceptionFilter());
  // ───────────────────────────────────────────────────────────────────────────

  app.enableCors({
    origin: 'http://localhost:4200',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  await app.listen(3000);
  console.log('🚀 UCAB-Services Backend corriendo en http://localhost:3000/api');
}
bootstrap();
