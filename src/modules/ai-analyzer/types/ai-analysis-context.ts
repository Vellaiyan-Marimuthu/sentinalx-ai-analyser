export interface AIAnalysisCluster {
  id: string;
  type: string;
  severity: string;
  confidence: number;
  status: string;
}

export interface AIAnalysisTarget {
  api: string;
  operationType: string;
  sensitivity: string;
  exposure: string;
}

export interface AIAnalysisTimeline {
  startTime: string;
  endTime: string;
}

export interface AIAnalysisMetrics {
  requestCount: number;
  ipCount: number;
  userCount: number;
  apiCount: number;
}

export interface AIAnalysisMetadata {
  blockedCount: number;
  nonBlockedCount: number;
  wafEventCount: number;
}

export interface AIAttackStory {
  headline: string;
  summary: string;
  timelineSummary: string;
  evidenceSummary: string[];
  recommendedInvestigation: string[];
}

export interface AIRepresentativeEvent {
  source: string;
  occurredAt: string;
  path: string;
  action: string;
  signal: string;
}

export interface AIAnalysisContext {
  cluster: AIAnalysisCluster;
  target: AIAnalysisTarget;
  timeline: AIAnalysisTimeline;
  metrics: AIAnalysisMetrics;
  signals: string[];
  evidence: string[];
  metadata: AIAnalysisMetadata;
  attackStory: AIAttackStory;
  representativeEvents: AIRepresentativeEvent[];
  applicationId: string;
  eventsTruncated: boolean;
}
