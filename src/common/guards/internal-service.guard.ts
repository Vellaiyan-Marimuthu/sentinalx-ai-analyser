import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { timingSafeEqual } from 'crypto';
import { Request } from 'express';
import { UnauthorizedAnalyzerException } from '../exceptions/analyzer.exceptions';

@Injectable()
export class InternalServiceGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const expected = this.configService.get<string>('auth.internalServiceToken') ?? '';
    if (!expected) {
      throw new UnauthorizedAnalyzerException('Internal service token is not configured');
    }

    const request = context.switchToHttp().getRequest<Request>();
    const header = request.headers.authorization ?? '';
    if (!header.startsWith('Bearer ')) {
      throw new UnauthorizedAnalyzerException();
    }

    const provided = header.slice('Bearer '.length);
    if (!safeEqual(provided, expected)) {
      throw new UnauthorizedAnalyzerException();
    }

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
