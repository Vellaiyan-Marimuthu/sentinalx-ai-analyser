import {
  AIEvidenceAssessment,
  AIInvestigationStep,
  AIRecommendation,
} from './ai-recommendation';

export interface AIAnalysisResult {
  analysisVersion: string;
  executiveSummary: string;
  whatHappened: string;
  whyItMatters: string;
  evidenceAssessment: AIEvidenceAssessment[];
  investigation: AIInvestigationStep[];
  recommendations: AIRecommendation[];
  limitations: string[];
  generatedAt: string;
}

export interface AIAnalysisApiResponse {
  id: string;
  clusterId: string;
  status: string;
  analysis: Omit<AIAnalysisResult, 'analysisVersion' | 'generatedAt'> | null;
  fallback?: {
    message: string;
  };
}
