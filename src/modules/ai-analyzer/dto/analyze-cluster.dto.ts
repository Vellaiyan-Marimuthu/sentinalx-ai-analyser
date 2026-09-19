import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsDefined,
  IsIn,
  IsISO8601,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
  ValidateNested,
} from 'class-validator';

const SEVERITIES = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

export class ClusterInputDto {
  @ApiProperty({ example: 'cluster-uuid' })
  @IsString({ message: 'Required field cluster.id is missing' })
  @IsNotEmpty({ message: 'Required field cluster.id is missing' })
  id!: string;

  @ApiProperty({ example: 'XSS_CAMPAIGN' })
  @IsString({ message: 'Required field cluster.type is missing' })
  @IsNotEmpty({ message: 'Required field cluster.type is missing' })
  type!: string;

  @ApiProperty({ example: 'HIGH', enum: SEVERITIES })
  @IsString({ message: 'Required field cluster.severity is missing' })
  @IsNotEmpty({ message: 'Required field cluster.severity is missing' })
  @IsIn(SEVERITIES, { message: 'cluster.severity must be one of LOW, MEDIUM, HIGH, CRITICAL' })
  severity!: (typeof SEVERITIES)[number];

  @ApiProperty({ example: 0.87, minimum: 0, maximum: 1 })
  @IsNumber({}, { message: 'Required field cluster.confidence is missing' })
  @Min(0)
  @Max(1)
  confidence!: number;

  @ApiProperty({ example: 'OPEN' })
  @IsString({ message: 'Required field cluster.status is missing' })
  @IsNotEmpty({ message: 'Required field cluster.status is missing' })
  status!: string;
}

export class TargetInputDto {
  @ApiPropertyOptional({ example: 'api-uuid' })
  @IsOptional()
  @IsString()
  apiId?: string;

  @ApiPropertyOptional({ example: 'GET' })
  @IsOptional()
  @IsString()
  method?: string;

  @ApiPropertyOptional({ example: '/api/search' })
  @IsOptional()
  @IsString()
  api?: string;

  @ApiPropertyOptional({ example: 'SEARCH' })
  @IsOptional()
  @IsString()
  operationType?: string;

  @ApiPropertyOptional({ example: 'NORMAL' })
  @IsOptional()
  @IsString()
  sensitivity?: string;

  @ApiPropertyOptional({ example: 'PUBLIC' })
  @IsOptional()
  @IsString()
  exposure?: string;
}

export class TimelineInputDto {
  @ApiProperty({ example: '2026-09-19T01:02:00.000Z' })
  @IsISO8601({}, { message: 'Required field timeline.startTime must be an ISO-8601 timestamp' })
  startTime!: string;

  @ApiProperty({ example: '2026-09-19T01:06:00.000Z' })
  @IsISO8601({}, { message: 'Required field timeline.endTime must be an ISO-8601 timestamp' })
  endTime!: string;
}

export class MetricsInputDto {
  @ApiProperty({ example: 16 })
  @IsNumber({}, { message: 'Required field metrics.requestCount is missing' })
  @Min(0)
  requestCount!: number;

  @ApiProperty({ example: 5 })
  @IsNumber({}, { message: 'Required field metrics.ipCount is missing' })
  @Min(0)
  ipCount!: number;

  @ApiProperty({ example: 0 })
  @IsNumber({}, { message: 'Required field metrics.userCount is missing' })
  @Min(0)
  userCount!: number;

  @ApiProperty({ example: 1 })
  @IsNumber({}, { message: 'Required field metrics.apiCount is missing' })
  @Min(0)
  apiCount!: number;
}

export class SourceBreakdownDto {
  @ApiProperty({ example: 0, minimum: 0 })
  @IsNumber({}, { message: 'Required field sourceBreakdown.agentEventCount is missing' })
  @Min(0)
  agentEventCount!: number;

  @ApiProperty({ example: 16, minimum: 0 })
  @IsNumber({}, { message: 'Required field sourceBreakdown.wafEventCount is missing' })
  @Min(0)
  wafEventCount!: number;
}

export class MetadataInputDto {
  @ApiPropertyOptional({ example: 14 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  blockedCount?: number;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  nonBlockedCount?: number;

  @ApiPropertyOptional({ example: 16 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  wafEventCount?: number;
}

export class AttackStoryInputDto {
  @ApiProperty({ example: 'XSS campaign detected' })
  @IsString({ message: 'Required field attackStory.headline is missing' })
  @IsNotEmpty({ message: 'Required field attackStory.headline is missing' })
  headline!: string;

  @ApiProperty({
    example:
      'SentinelX correlated 16 XSS-related requests from 5 IP addresses targeting /api/search within five minutes. AWS WAF blocked 14 requests while 2 were not blocked.',
  })
  @IsString({ message: 'Required field attackStory.summary is missing' })
  @IsNotEmpty({ message: 'Required field attackStory.summary is missing' })
  summary!: string;

  @ApiPropertyOptional({ example: 'Activity occurred between 01:02 and 01:06 UTC.' })
  @IsOptional()
  @IsString()
  timelineSummary?: string;

  @ApiPropertyOptional({
    type: [String],
    example: ['16 XSS-related WAF events', '5 unique source IPs'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evidenceSummary?: string[];

  @ApiPropertyOptional({
    type: [String],
    example: ['Review the two non-blocked requests'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  recommendedInvestigation?: string[];
}

export class RepresentativeEventDto {
  @ApiProperty({ example: 'AWS_WAF' })
  @IsString({ message: 'Required field representativeEvents.source is missing' })
  @IsNotEmpty({ message: 'Required field representativeEvents.source is missing' })
  source!: string;

  @ApiProperty({ example: '2026-09-19T01:02:12.000Z' })
  @IsISO8601({}, { message: 'Required field representativeEvents.occurredAt must be an ISO-8601 timestamp' })
  occurredAt!: string;

  @ApiPropertyOptional({ example: 'GET' })
  @IsOptional()
  @IsString()
  method?: string;

  @ApiPropertyOptional({ example: '/api/search' })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiPropertyOptional({ example: 'BLOCKED' })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({ example: 'WAF_RULE_MATCH' })
  @IsOptional()
  @IsString()
  signal?: string;

  @ApiPropertyOptional({ example: 'AWS-AWSManagedRulesCommonRuleSet' })
  @IsOptional()
  @IsString()
  wafRuleId?: string;
}

export class AnalyzeClusterDto {
  @ApiProperty({ type: ClusterInputDto })
  @IsDefined({ message: 'Required field cluster is missing' })
  @ValidateNested()
  @Type(() => ClusterInputDto)
  cluster!: ClusterInputDto;

  @ApiPropertyOptional({ type: TargetInputDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TargetInputDto)
  target?: TargetInputDto;

  @ApiProperty({ type: TimelineInputDto })
  @IsDefined({ message: 'Required field timeline is missing' })
  @ValidateNested()
  @Type(() => TimelineInputDto)
  timeline!: TimelineInputDto;

  @ApiProperty({ type: MetricsInputDto })
  @IsDefined({ message: 'Required field metrics is missing' })
  @ValidateNested()
  @Type(() => MetricsInputDto)
  metrics!: MetricsInputDto;

  @ApiProperty({ type: SourceBreakdownDto })
  @IsDefined({ message: 'Required field sourceBreakdown is missing' })
  @ValidateNested()
  @Type(() => SourceBreakdownDto)
  sourceBreakdown!: SourceBreakdownDto;

  @ApiProperty({ type: [String], example: ['WAF_XSS'] })
  @IsArray({ message: 'Required field signals is missing' })
  @IsString({ each: true })
  @ArrayMaxSize(20)
  signals!: string[];

  @ApiProperty({
    type: [String],
    example: [
      '5 unique IP addresses',
      '16 XSS-related WAF events',
      '14 blocked by WAF',
      '2 not blocked by WAF',
    ],
  })
  @IsArray({ message: 'Required field evidence is missing' })
  @IsString({ each: true })
  @ArrayMaxSize(50)
  evidence!: string[];

  @ApiPropertyOptional({ type: MetadataInputDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => MetadataInputDto)
  metadata?: MetadataInputDto;

  @ApiProperty({ type: AttackStoryInputDto })
  @IsDefined({ message: 'Required field attackStory is missing' })
  @ValidateNested()
  @Type(() => AttackStoryInputDto)
  attackStory!: AttackStoryInputDto;

  @ApiPropertyOptional({ type: [RepresentativeEventDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RepresentativeEventDto)
  @ArrayMaxSize(10)
  representativeEvents?: RepresentativeEventDto[];
}
