/**
 * Vercel serverless entry point.
 * Bootstraps NestJS once and re-uses the instance across warm invocations.
 */
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import cookieParser from 'cookie-parser';
import { AppModule } from './app.module';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { API_PREFIX } from '@talent-casting/shared';

const server = express();
let isReady = false;

async function bootstrap(): Promise<express.Express> {
  if (isReady) return server;

  const app = await NestFactory.create(AppModule, new ExpressAdapter(server), {
    logger: ['error', 'warn'],
  });

  app.setGlobalPrefix(API_PREFIX);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.use(cookieParser());

  app.enableCors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  });

  await app.init();
  isReady = true;
  return server;
}

// Vercel serverless handler
export default async (req: any, res: any) => {
  const app = await bootstrap();
  app(req, res);
};
