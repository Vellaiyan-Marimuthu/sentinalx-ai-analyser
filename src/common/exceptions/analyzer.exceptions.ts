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
  constructor(message = 'Invalid or missing internal service token') {
    super('UNAUTHORIZED', HttpStatus.UNAUTHORIZED, message);
  }
}

export class AiProviderException extends AnalyzerException {
  constructor(message = 'AI analysis provider unavailable') {
    super('AI_PROVIDER_ERROR', HttpStatus.BAD_GATEWAY, message);
  }
}

export class AiAnalysisTimeoutException extends AnalyzerException {
  constructor(message = 'AI analysis timed out') {
    super('AI_ANALYSIS_TIMEOUT', HttpStatus.GATEWAY_TIMEOUT, message);
  }
}

export class InvalidAiResponseException extends AnalyzerException {
  constructor(message = 'AI provider returned an invalid analysis payload') {
    super('INVALID_AI_RESPONSE', HttpStatus.BAD_GATEWAY, message);
  }
}

export class OmniTimeoutError extends Error {
  constructor(message = 'Omni request timed out') {
    super(message);
    this.name = 'OmniTimeoutError';
  }
}

export class OmniProviderError extends Error {
  constructor(message = 'Omni provider unavailable') {
    super(message);
    this.name = 'OmniProviderError';
  }
}
