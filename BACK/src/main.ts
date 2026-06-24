import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // AQUÍ ACTIVAS LOS CORS
  app.enableCors({
    origin: 'http://localhost:4200', // El puerto donde corre tu Angular
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  (BigInt.prototype as any).toJSON = function () {
    return this.toString();
  };

  await app.listen(3000); // Tu backend correrá en el puerto 3000
}
bootstrap();