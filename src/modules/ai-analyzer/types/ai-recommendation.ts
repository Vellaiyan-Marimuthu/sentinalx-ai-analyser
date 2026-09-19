import { RecommendationType } from '../enums/recommendation-type.enum';

export interface AIRecommendation {
  type: RecommendationType | string;
  target: string;
  reason: string;
  confidence?: number;
}

export interface AIInvestigationStep {
  priority: 'HIGH' | 'MEDIUM' | 'LOW' | string;
  action: string;
  reason: string;
}

export interface AIEvidenceAssessment {
  fact: string;
  interpretation: string;
}
