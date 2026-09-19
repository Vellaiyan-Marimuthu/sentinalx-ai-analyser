import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EvidenceAssessmentDto {
  @ApiProperty({ example: '16 XSS-related requests were detected targeting /api/search.' })
  fact!: string;

  @ApiProperty({
    example: 'This indicates coordinated probing of the public search endpoint.',
  })
  interpretation!: string;
}

export class InvestigationStepDto {
  @ApiProperty({ example: 'HIGH', enum: ['HIGH', 'MEDIUM', 'LOW'] })
  priority!: string;

  @ApiProperty({ example: 'Review application logs for the two non-blocked requests.' })
  action!: string;

  @ApiProperty({ example: 'These requests were not blocked by the WAF.' })
  reason!: string;
}

export class RecommendationDto {
  @ApiProperty({ example: 'WAF_RULE_REVIEW' })
  type!: string;

  @ApiProperty({ example: '/api/search' })
  target!: string;

  @ApiProperty({ example: 'Two XSS-related requests were not blocked.' })
  reason!: string;

  @ApiPropertyOptional({ example: 0.82 })
  confidence?: number;
}

export class AnalysisBodyDto {
  @ApiProperty()
  executiveSummary!: string;

  @ApiProperty()
  whatHappened!: string;

  @ApiProperty()
  whyItMatters!: string;

  @ApiProperty({ type: [EvidenceAssessmentDto] })
  evidenceAssessment!: EvidenceAssessmentDto[];

  @ApiProperty({ type: [InvestigationStepDto] })
  investigation!: InvestigationStepDto[];

  @ApiProperty({ type: [RecommendationDto] })
  recommendations!: RecommendationDto[];

  @ApiProperty({ type: [String] })
  limitations!: string[];
}

export class AnalysisFallbackDto {
  @ApiProperty({
    example: 'AI analysis unavailable. Deterministic attack story remains available.',
  })
  message!: string;
}

export class AnalysisApiResponseDto {
  @ApiProperty({ example: 'fe807091-4805-4649-bbbc-fb7aff56ef2b' })
  id!: string;

  @ApiProperty({ example: 'cluster-uuid' })
  clusterId!: string;

  @ApiProperty({ example: 'COMPLETED', enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'] })
  status!: string;

  @ApiPropertyOptional({ type: AnalysisBodyDto, nullable: true })
  analysis!: AnalysisBodyDto | null;

  @ApiPropertyOptional({ type: AnalysisFallbackDto })
  fallback?: AnalysisFallbackDto;
}

export class ErrorResponseDto {
  @ApiProperty({ example: false })
  success!: boolean;

  @ApiProperty({
    example: { code: 'INVALID_ANALYSIS_REQUEST', message: 'Required field cluster is missing' },
  })
  error!: { code: string; message?: string };
}

export class HealthResponseDto {
  @ApiProperty({ example: true })
  success!: boolean;

  @ApiProperty({ example: 'sentinelx-ai-analyzer' })
  service!: string;

  @ApiProperty({ example: 'ok' })
  status!: string;
}
