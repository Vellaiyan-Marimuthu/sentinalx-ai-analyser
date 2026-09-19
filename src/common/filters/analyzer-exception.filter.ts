import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { AnalyzerException } from '../exceptions/analyzer.exceptions';

@Catch()
export class AnalyzerExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(AnalyzerExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const response = host.switchToHttp().getResponse<Response>();

    if (exception instanceof AnalyzerException) {
      response.status(exception.getStatus()).json(exception.getResponse());
      return;
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const payload = exception.getResponse();
      response.status(status).json(
        typeof payload === 'object'
          ? payload
          : {
              success: false,
              error: {
                code: 'INVALID_REQUEST',
                message: String(payload),
              },
            },
      );
      return;
    }

    this.logger.error(
      'Unhandled analyzer error',
      exception instanceof Error ? exception.stack : String(exception),
    );

    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      success: false,
      error: {
        code: 'INTERNAL_ERROR',
        message: 'Unexpected analyzer failure',
      },
    });
  }
}
