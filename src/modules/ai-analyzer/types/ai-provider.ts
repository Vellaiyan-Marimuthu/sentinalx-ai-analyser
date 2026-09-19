import { AIAnalysisContext } from './ai-analysis-context';
import { AIAnalysisResult } from './ai-analysis-result';

export interface AIProvider {
  analyze(context: AIAnalysisContext): Promise<AIAnalysisResult>;
}

export const AI_PROVIDER = Symbol('AI_PROVIDER');
