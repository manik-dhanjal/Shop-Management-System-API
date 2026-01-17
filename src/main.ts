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
  app.enableCors();
  app.setGlobalPrefix('api');

  // Initiate swagger for API documentation
  const config = new DocumentBuilder()
    .setTitle('Shop Management System')
    .setDescription(
      'API for handling CRUD operations for Shop Management System',
    )
    .setVersion('1.0')
    .addTag('shops')
    .build();
  const documentFactory = () => SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('oas-docs', app, documentFactory);

  // expose 3001 port for APIs
  await app.listen(process.env.PORT || 3001);
}
bootstrap();
