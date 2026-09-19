import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ValidationError } from 'class-validator';
import { mkdirSync } from 'fs';
import { dirname } from 'path';
import { AppModule } from './app.module';
import { InvalidAnalysisRequestException } from './common/exceptions/analyzer.exceptions';
import { AnalyzerExceptionFilter } from './common/filters/analyzer-exception.filter';
import { RequestIdInterceptor } from './common/interceptors/request-id.interceptor';

function firstValidationMessage(errors: ValidationError[]): string {
  for (const error of errors) {
    if (error.constraints) {
      return Object.values(error.constraints)[0];
    }
    if (error.children?.length) {
      return firstValidationMessage(error.children);
    }
  }
  return 'Required field is missing';
}

async function bootstrap(): Promise<void> {
  const configPreview = {
    databasePath: process.env.DATABASE_PATH ?? 'data/sentinelx.sqlite',
  };
  mkdirSync(dirname(configPreview.databasePath), { recursive: true });

  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.setGlobalPrefix('api/v1');
  app.enableCors();
  app.useGlobalInterceptors(new RequestIdInterceptor());
  app.useGlobalFilters(new AnalyzerExceptionFilter());
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: false,
      exceptionFactory: (errors: ValidationError[]) =>
        new InvalidAnalysisRequestException(firstValidationMessage(errors)),
    }),
  );

  const swagger = new DocumentBuilder()
    .setTitle('SentinelX AI Analyzer')
    .setDescription(
      'Explains persisted Attack Clusters and recommends investigation. Detection, severity, and enforcement stay deterministic and human-controlled.',
    )
    .setVersion('1.0')
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-api-key',
        in: 'header',
        description: 'Application API key',
      },
      'api-key',
    )
    .build();

  SwaggerModule.setup('api/docs', app, SwaggerModule.createDocument(app, swagger), {
    swaggerOptions: {
      persistAuthorization: true,
    },
  });

  const port = configService.get<number>('port') ?? 3005;
  await app.listen(port);
}

void bootstrap();
