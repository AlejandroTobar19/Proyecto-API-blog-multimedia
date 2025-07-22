import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { useContainer } from 'class-validator';
import { RolesGuard } from './auth/roles.guard';
import { Reflector } from '@nestjs/core';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Permitir el uso de validaciones que dependen de inyección de dependencias
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  app.useGlobalGuards(new RolesGuard(new Reflector()));
  // Pipes globales de validación y transformación
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // elimina propiedades que no están en los DTOs
      forbidNonWhitelisted: true, // lanza error si se manda algo extra
      transform: true, // convierte payloads a instancias de clases
    }),
  );

  await app.listen(3000);
}
bootstrap();
