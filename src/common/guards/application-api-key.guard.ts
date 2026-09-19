import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';
import { Request } from 'express';
import { UnauthorizedAnalyzerException } from '../exceptions/analyzer.exceptions';

export type AuthenticatedRequest = Request & {
  applicationId: string;
};

@Injectable()
export class ApplicationApiKeyGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = this.configService.get<string>('auth.applicationApiKey') ?? '';
    const applicationId = this.configService.get<string>('auth.applicationId') ?? '';

    if (!expected || !applicationId) {
      throw new UnauthorizedAnalyzerException('Application API key is not configured');
    }

    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const provided = String(request.headers['x-api-key'] ?? '');

    if (!safeEqual(provided, expected)) {
      throw new UnauthorizedAnalyzerException();
    }

    request.applicationId = applicationId;
    return true;
  }
}

function safeEqual(provided: string, expected: string): boolean {
  const providedBuffer = Buffer.from(provided);
  const expectedBuffer = Buffer.from(expected);

  if (providedBuffer.length !== expectedBuffer.length) {
    return false;
  }

  return timingSafeEqual(providedBuffer, expectedBuffer);
}
