export type SuggestedPolicyType = 'RATE_LIMIT' | 'BLOCK_IP' | 'CHALLENGE' | 'ALERT';

export interface SuggestedPolicy {
  type: SuggestedPolicyType | null;
  scope?: string;
  reason?: string;
}

export interface AIAnalysisResult {
  executiveSummary: string;
  attackExplanation: string;
  riskExplanation: string;
  investigationSteps: string[];
  recommendations: string[];
  suggestedPolicy: SuggestedPolicy | null;
}
