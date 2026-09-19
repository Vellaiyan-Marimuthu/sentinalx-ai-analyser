import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import OpenAI, { APIConnectionTimeoutError, APIError, RateLimitError } from 'openai';
import { AiProviderError, AiTimeoutError } from '../../../common/exceptions/analyzer.exceptions';
import {
  SECURITY_ANALYSIS_SYSTEM_PROMPT,
  buildUserPrompt,
} from '../prompts/security-analysis.prompt';
import { AIAnalysisContext } from '../types/ai-analysis-context';
import { AIAnalysisResult } from '../types/ai-analysis-result';
import { AIProvider } from '../types/ai-provider';
import { AiResponseParserService } from './ai-response-parser.service';

@Injectable()
export class OpenAIProvider implements AIProvider {
  private readonly logger = new Logger(OpenAIProvider.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly parser: AiResponseParserService,
  ) {}

  async analyze(context: AIAnalysisContext): Promise<AIAnalysisResult> {
    const apiKey = this.configService.get<string>('openai.apiKey') ?? '';
    const baseURL = this.configService.get<string>('openai.baseUrl') ?? 'https://api.openai.com/v1';
    const model = this.configService.get<string>('ai.model') ?? 'gpt-4o';
    const temperature = this.configService.get<number>('ai.temperature') ?? 0;
    const timeoutMs = this.configService.get<number>('ai.timeoutMs') ?? 30_000;
    const maxRetries = this.configService.get<number>('ai.maxRetries') ?? 1;

    if (!apiKey) {
      throw new AiProviderError('OPENAI_API_KEY is not configured');
    }

    const client = new OpenAI({
      apiKey,
      baseURL,
      timeout: timeoutMs,
      maxRetries: 0,
    });

    let lastError: Error = new AiProviderError();

    for (let attempt = 0; attempt <= maxRetries; attempt += 1) {
      try {
        const completion = await client.chat.completions.create({
          model,
          temperature,
          response_format: { type: 'json_object' },
          messages: [
            { role: 'system', content: SECURITY_ANALYSIS_SYSTEM_PROMPT },
            { role: 'user', content: buildUserPrompt(context) },
          ],
        });

        const content = completion.choices[0]?.message?.content?.trim() ?? '';
        if (!content) {
          throw new AiProviderError('OpenAI returned an empty completion');
        }

        const parsed = this.parser.parse(content);
        return {
          ...parsed,
          generatedAt: parsed.generatedAt || new Date().toISOString(),
        };
      } catch (error) {
        lastError = toProviderError(error);
        const retryable = isRetryable(lastError);
        if (!retryable || attempt === maxRetries) {
          throw lastError;
        }

        this.logger.warn(
          `OpenAI request failed (attempt ${attempt + 1}/${maxRetries + 1}); retrying once`,
        );
      }
    }

    throw lastError;
  }
}

function toProviderError(error: unknown): Error {
  if (error instanceof AiTimeoutError || error instanceof AiProviderError) {
    return error;
  }

  if (error instanceof APIConnectionTimeoutError) {
    return new AiTimeoutError();
  }

  if (error instanceof RateLimitError) {
    return new AiProviderError('OpenAI returned HTTP 429');
  }

  if (error instanceof APIError) {
    if (error.status === 408 || error.code === 'timeout') {
      return new AiTimeoutError();
    }
    return new AiProviderError(
      error.status ? `OpenAI returned HTTP ${error.status}` : 'OpenAI provider unavailable',
    );
  }

  if (error instanceof Error && /timeout/i.test(error.message)) {
    return new AiTimeoutError();
  }

  return new AiProviderError(error instanceof Error ? error.message : 'OpenAI provider unavailable');
}

function isRetryable(error: Error): boolean {
  return (
    error instanceof AiTimeoutError ||
    (error instanceof AiProviderError && /HTTP 429|HTTP 5\d\d|unavailable|empty completion/i.test(error.message))
  );
}
