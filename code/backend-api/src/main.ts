import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { AppModule } from './app.module';
import { PrismaService } from './prisma.service';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // Enable CORS
  app.enableCors({
    origin: process.env.CORS_ORIGIN === '*' ? true : (process.env.CORS_ORIGIN || 'http://localhost:3000').split(','),
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Serve static files from public directory (for admin UI)
  app.useStaticAssets(join(process.cwd(), 'public'), {
    prefix: '/',
  });

  // Serve static files from uploads directory
  const uploadsDir = process.env.UPLOAD_DIR || './uploads';
  app.useStaticAssets(join(process.cwd(), uploadsDir), {
    prefix: '/uploads/',
  });

  // Global prefix (must come after static assets)
  app.setGlobalPrefix('api');

  // Prisma shutdown hook
  const prismaService = app.get(PrismaService);
  await prismaService.enableShutdownHooks(app);

  const port = process.env.PORT || 3001;
  const host = process.env.HOST || '0.0.0.0';
  await app.listen(port, host);

  console.log(`🚀 Server is running on: http://${host}:${port}/api`);
  console.log(`📁 Static files served from: /uploads/`);
}
bootstrap();
