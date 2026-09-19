import { HttpException, HttpStatus } from '@nestjs/common';

export class AnalyzerException extends HttpException {
  constructor(
    public readonly code: string,
    status: HttpStatus,
    message?: string,
  ) {
    super(
      {
        success: false,
        error: message ? { code, message } : { code },
      },
      status,
    );
  }
}

export class InvalidAnalysisRequestException extends AnalyzerException {
  constructor(message: string) {
    super('INVALID_ANALYSIS_REQUEST', HttpStatus.BAD_REQUEST, message);
  }
}

export class UnauthorizedAnalyzerException extends AnalyzerException {
  constructor(message = 'Invalid or missing application API key') {
    super('UNAUTHORIZED', HttpStatus.UNAUTHORIZED, message);
  }
}

export class AnalysisNotFoundException extends AnalyzerException {
  constructor(clusterId: string) {
    super(
      'ANALYSIS_NOT_FOUND',
      HttpStatus.NOT_FOUND,
      `No AI analysis exists for cluster ${clusterId}`,
    );
  }
}

export class AiProviderError extends Error {
  constructor(message = 'AI analysis provider unavailable') {
    super(message);
    this.name = 'AiProviderError';
  }
}

export class AiTimeoutError extends Error {
  constructor(message = 'AI analysis timed out') {
    super(message);
    this.name = 'AiTimeoutError';
  }
}
