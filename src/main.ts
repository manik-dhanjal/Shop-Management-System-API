import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe, VersioningType } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // enable URI versioning onto endpoints
  app.enableVersioning({
    type: VersioningType.URI,
  });

  // Initate validation pipeline for DTOs
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );
  const allowedOrigins = (process.env.FRONTEND_URL || '')
    .split(',')
    .map((u) => u.trim())
    .filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      // allow any Vercel preview deployment for this project
      const isVercelPreview =
        /^https:\/\/shop-management-system[a-z0-9-]*\.vercel\.app$/.test(
          origin,
        );
      if (isVercelPreview || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`Origin ${origin} not allowed by CORS`));
      }
    },
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  app.setGlobalPrefix('api');

  // Initiate swagger for API documentation
  const config = new DocumentBuilder()
    .setTitle('Shop Management System')
    .setDescription(
      'API for handling CRUD operations for Shop Management System',
    )
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'Authorization',
        description: 'Enter JWT token',
        in: 'header',
      },
      'jwt-auth', // 👈 this is the key name
    )
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);

  // 🔥 THIS IS THE MAGIC LINE
  document.security = [{ 'jwt-auth': [] }];
  SwaggerModule.setup('docs', app, document);

  // expose 3001 port for APIs
  await app.listen(process.env.PORT || 3000);
}
bootstrap();
