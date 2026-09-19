import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SuggestedPolicyDto {
  @ApiPropertyOptional({
    example: 'RATE_LIMIT',
    enum: ['RATE_LIMIT', 'BLOCK_IP', 'CHALLENGE', 'ALERT', null],
    nullable: true,
  })
  type!: 'RATE_LIMIT' | 'BLOCK_IP' | 'CHALLENGE' | 'ALERT' | null;

  @ApiPropertyOptional({ example: '/api/search' })
  scope?: string;

  @ApiPropertyOptional({
    example: 'Repeated XSS-related traffic targeted the same public endpoint.',
  })
  reason?: string;
}

export class AnalyzeResponseDto {
  @ApiProperty({
    example: 'A coordinated XSS probing campaign targeted the public search endpoint.',
  })
  executiveSummary!: string;

  @ApiProperty({
    example:
      'Multiple XSS-related WAF matches targeted the same endpoint within a short period.',
  })
  attackExplanation!: string;

  @ApiProperty({
    example:
      'Two related requests were not blocked by WAF. This does not establish successful exploitation, but those requests warrant follow-up investigation.',
  })
  riskExplanation!: string;

  @ApiProperty({
    type: [String],
    example: [
      'Review application activity following the non-blocked requests.',
      'Inspect related authentication and session activity.',
      'Review output encoding on the affected endpoint.',
    ],
  })
  investigationSteps!: string[];

  @ApiProperty({
    type: [String],
    example: [
      'Review XSS defenses on /api/search.',
      'Consider rate limiting repeated attack-related traffic.',
    ],
  })
  recommendations!: string[];

  @ApiPropertyOptional({ type: SuggestedPolicyDto, nullable: true })
  suggestedPolicy!: SuggestedPolicyDto | null;
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
