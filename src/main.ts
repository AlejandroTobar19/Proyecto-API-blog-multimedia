import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { useContainer } from 'class-validator';
import { RolesGuard } from './auth/roles.guard';
import { Reflector } from '@nestjs/core';
import * as express from 'express';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Habilitar CORS por si más adelante usás un frontend
  app.enableCors();

  // Exponer carpeta uploads de forma pública
  app.use('/uploads', express.static(join(__dirname, '..', 'uploads')));

  // Validaciones con inyección
  useContainer(app.select(AppModule), { fallbackOnErrors: true });

  // Roles global guard
  app.useGlobalGuards(new RolesGuard(new Reflector()));

  // Validaciones globales
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  await app.listen(3000);
}
bootstrap();
