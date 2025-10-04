import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import * as cookieParser from 'cookie-parser';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  try {
    const app = await NestFactory.create(AppModule);
  
  // Swagger configuration
  const config = new DocumentBuilder()
    .setTitle('Mongoose CRUD API')
    .setDescription('The Mongoose CRUD API description')
    .setVersion('1.0')
    .addTag('auth')
    .addCookieAuth('connect.sid')
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  app.useGlobalPipes(new ValidationPipe());
  app.use(cookieParser());
  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true,
  })
  await app.listen(process.env.PORT ?? 3000);
  console.log(`Application is running on: http://localhost:${process.env.PORT ?? 3000}`);
  } catch (error) {
    console.log('Error starting the application:', error);
    process.exit(1);
  }
}
bootstrap();
