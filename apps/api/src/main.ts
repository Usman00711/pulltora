import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import helmet from 'helmet';
import compression from 'compression';
import { AppModule } from './app.module';

function isTruthy(value?: string) {
  return ['1', 'true', 'yes', 'on'].includes((value || '').toLowerCase());
}

function validateProductionEnvironment() {
  if (process.env.NODE_ENV !== 'production') {
    return;
  }

  const required = [
    'MONGODB_URI',
    'MONGODB_DB_NAME',
    'JWT_SECRET',
    'ALLOWED_ORIGINS'
  ];
  const missing = required.filter((key) => !process.env[key]?.trim());

  if (missing.length > 0) {
    throw new Error(
      `Missing required production environment variables: ${missing.join(', ')}`
    );
  }

  const allowedOrigins = process.env.ALLOWED_ORIGINS || '';

  if (allowedOrigins.includes('*') || allowedOrigins.includes('localhost')) {
    throw new Error(
      'ALLOWED_ORIGINS must contain deployed frontend origins only in production.'
    );
  }

  if ((process.env.JWT_SECRET || '').length < 32) {
    throw new Error('JWT_SECRET must be at least 32 characters in production.');
  }
}

async function bootstrap() {
  validateProductionEnvironment();

  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.use(helmet());
  app.use(compression());

  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true
  });

  const apiPrefix = process.env.API_PREFIX || '/api/v1';
  app.setGlobalPrefix(apiPrefix);
  const port = Number(process.env.PORT || 3001);

  if (process.env.NODE_ENV !== 'production' || isTruthy(process.env.ENABLE_SWAGGER)) {
    const config = new DocumentBuilder()
      .setTitle('Pulltora API')
      .setDescription('Delivery intelligence backend for Pulltora')
      .setVersion('1.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup(`${apiPrefix}/docs`, app, document);
  }

  await app.listen(port);
}

void bootstrap();
