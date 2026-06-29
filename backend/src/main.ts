import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());

  app.useGlobalPipes(new ValidationPipe(
    {whitelist: true, forbidNonWhitelisted: true, transform: true}
  ));
  
  const configService = app.get(ConfigService);
  const port = configService.get<number>('PORT', 4000);

  app.use(cookieParser());
  
  app.enableCors({
    origin: configService.get<string>('CORS_ORIGIN', 'http://localhost:3000'),
    credentials: true,
  })


  const swaggerConfig = new DocumentBuilder().setTitle('SentinelOps API').setDescription("Incident Management API with auth, audit timeline, evidence and analytics")
  .setVersion("1.0")
  .addSecurity('accessToken',{
    type: 'apiKey',
    in: 'cookie',
    name: 'accessToken'
  })
  .addSecurity('refreshToken', {
    type: 'apiKey',
    in: 'cookie',
    name: 'refreshToken'
  })
  .addSecurity('csrfToken', {
    type: 'apiKey',
    in: 'header',
    name: 'x-csrf-token'
  })
  .addTag("auth").addTag("incidents").addTag("evidence").addTag("dashboard").build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig)

  SwaggerModule.setup('api', app, swaggerDocument, {swaggerOptions: {
    persistAuthorization: true
  },
    customSiteTitle: 'SentinelOps API docs'});

  await app.listen(port);
}
bootstrap();
