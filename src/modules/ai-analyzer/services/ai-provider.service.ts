import { Inject, Injectable } from '@nestjs/common';
import { AIAnalysisContext } from '../types/ai-analysis-context';
import { AIAnalysisResult } from '../types/ai-analysis-result';
import { AI_PROVIDER, AIProvider } from '../types/ai-provider';

@Injectable()
export class AiProviderService implements AIProvider {
  constructor(@Inject(AI_PROVIDER) private readonly provider: AIProvider) {}

  analyze(context: AIAnalysisContext): Promise<AIAnalysisResult> {
    return this.provider.analyze(context);
  }
}
