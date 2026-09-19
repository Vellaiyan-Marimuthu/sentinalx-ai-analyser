import { Injectable } from '@nestjs/common';

const SENSITIVE_KEY_PATTERN =
  /^(password|passwd|secret|token|authorization|cookie|cookies|rawbody|body|requestbody|credential|credentials|apikey|paymenttoken|accesstoken|refreshtoken|set-cookie|setcookie|sessionsecret)$/i;

@Injectable()
export class AiSanitizerService {
  sanitize<T>(value: T): T {
    return this.sanitizeValue(value) as T;
  }

  isSensitiveField(key: string): boolean {
    return SENSITIVE_KEY_PATTERN.test(key.replace(/[_-]/g, ''));
  }

  private sanitizeValue(value: unknown): unknown {
    if (Array.isArray(value)) {
      return value.map((item) => this.sanitizeValue(item));
    }

    if (value && typeof value === 'object') {
      const sanitized: Record<string, unknown> = {};
      for (const [key, nested] of Object.entries(value as Record<string, unknown>)) {
        if (this.isSensitiveField(key) || nested === undefined || nested === null) {
          continue;
        }
        sanitized[key] = this.sanitizeValue(nested);
      }
      return sanitized;
    }

    return value;
  }
}
