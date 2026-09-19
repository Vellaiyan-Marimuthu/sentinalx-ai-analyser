import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI, { APIConnectionTimeoutError, APIError, RateLimitError } from 'openai';
import {
  OmniProviderError,
  OmniTimeoutError,
} from '../../common/exceptions/analyzer.exceptions';

export interface OmniCompletionResult {
  content: string;
  model: string;
}

@Injectable()
export class OmniClient {
  private readonly logger = new Logger(OmniClient.name);

  constructor(private readonly configService: ConfigService) {}

  async complete(systemPrompt: string, userPrompt: string): Promise<OmniCompletionResult> {
    const apiKey = this.configService.get<string>('openai.apiKey') ?? '';
    const baseURL = this.configService.get<string>('openai.baseUrl') ?? 'https://api.openai.com/v1';
    const model = this.configService.get<string>('openai.model') ?? 'gpt-4o';
    const timeoutMs = this.configService.get<number>('openai.timeoutMs') ?? 30_000;
    const maxRetries = this.configService.get<number>('openai.maxRetries') ?? 2;

    if (!apiKey) {
      throw new OmniProviderError('OPENAI_API_KEY is not configured');
    }

    const client = new OpenAI({
      apiKey,
      baseURL,
      timeout: timeoutMs,
      maxRetries: 0,
    });

    let lastError: Error = new OmniProviderError();

    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      try {
        const completion = await client.chat.completions.create({
          model,
          temperature: 0.2,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
        });

        const content = completion.choices[0]?.message?.content?.trim() ?? '';
        if (!content) {
          throw new OmniProviderError('OpenAI returned an empty completion');
        }

        return {
          content,
          model: completion.model ?? model,
        };
      } catch (error) {
        lastError = toProviderError(error);

        if (!isRetryable(lastError) || attempt === maxRetries) {
          throw lastError;
        }

        const delayMs = 250 * 2 ** attempt;
        this.logger.warn(
          `OpenAI request failed (attempt ${attempt + 1}/${maxRetries + 1}); retrying in ${delayMs}ms`,
        );
        await sleep(delayMs);
      }
    }

    throw lastError;
  }
}

function toProviderError(error: unknown): Error {
  if (error instanceof OmniTimeoutError || error instanceof OmniProviderError) {
    return error;
  }

  if (error instanceof APIConnectionTimeoutError) {
    return new OmniTimeoutError();
  }

  if (error instanceof RateLimitError) {
    return new OmniProviderError('OpenAI returned HTTP 429');
  }

  if (error instanceof APIError) {
    if (error.status === 408 || error.code === 'timeout') {
      return new OmniTimeoutError();
    }

    return new OmniProviderError(
      error.status
        ? `OpenAI returned HTTP ${error.status}`
        : error.message || 'OpenAI provider unavailable',
    );
  }

  if (error instanceof Error && /timeout/i.test(error.message)) {
    return new OmniTimeoutError();
  }

  return new OmniProviderError(
    error instanceof Error ? error.message : 'OpenAI provider unavailable',
  );
}

function isRetryable(error: Error): boolean {
  if (error instanceof OmniTimeoutError) {
    return true;
  }

  return (
    error instanceof OmniProviderError &&
    /HTTP 429|HTTP 5\d\d|unavailable|empty completion/i.test(error.message)
  );
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
