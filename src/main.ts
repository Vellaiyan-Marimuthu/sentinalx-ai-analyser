import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { ValidationError } from 'class-validator';
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

  const port = configService.get<number>('port') ?? 3005;
  await app.listen(port);
}

void bootstrap();
