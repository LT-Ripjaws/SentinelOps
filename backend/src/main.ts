import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import cookieParser from 'cookie-parser';
import helmet from 'helmet';

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

  await app.listen(port);
}
bootstrap();
