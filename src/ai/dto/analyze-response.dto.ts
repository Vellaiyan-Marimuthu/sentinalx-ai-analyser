export type RecommendationType =
  | 'RATE_LIMIT'
  | 'AUTHENTICATION_POLICY'
  | 'IP_BLOCK'
  | 'SESSION_INVALIDATION'
  | 'MFA'
  | 'WAF_RULE'
  | 'API_PROTECTION'
  | string;

export interface AnalysisRecommendation {
  type: RecommendationType;
  target: string;
  suggestion: string;
}

export interface SuggestedPolicy {
  type: RecommendationType;
  api?: string;
  target?: string;
  parameters?: Record<string, unknown>;
  configuration?: Record<string, unknown>;
  reason?: string;
}

export interface IncidentAnalysis {
  summary: string;
  whatHappened: string[];
  whyItMatters: string[];
  potentialImpact: string[];
  investigationSteps: string[];
  recommendations: AnalysisRecommendation[];
  suggestedPolicy: SuggestedPolicy | null;
  limitations: string[];
}

export interface AnalyzeSuccessResponse {
  success: true;
  clusterId: string;
  analysis: IncidentAnalysis;
  metadata: {
    model: string;
    analyzedAt: string;
    analysisVersion: string;
    latencyMs?: number;
  };
}

export interface AnalyzeErrorResponse {
  success: false;
  error: {
    code: string;
    message?: string;
  };
}
