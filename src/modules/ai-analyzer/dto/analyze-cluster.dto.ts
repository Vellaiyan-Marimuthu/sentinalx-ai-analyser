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
  @ApiPropertyOptional({ example: 'cluster-uuid' })
  @IsOptional()
  @IsString()
  id?: string;

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

  @ApiPropertyOptional({ example: 'OPEN' })
  @IsOptional()
  @IsString()
  status?: string;
}

export class TargetInputDto {
  @ApiProperty({ example: '/api/search' })
  @IsString({ message: 'Required field target.api is missing' })
  @IsNotEmpty({ message: 'Required field target.api is missing' })
  api!: string;

  @ApiProperty({ example: 'SEARCH' })
  @IsString({ message: 'Required field target.operationType is missing' })
  @IsNotEmpty({ message: 'Required field target.operationType is missing' })
  operationType!: string;

  @ApiProperty({ example: 'NORMAL' })
  @IsString({ message: 'Required field target.sensitivity is missing' })
  @IsNotEmpty({ message: 'Required field target.sensitivity is missing' })
  sensitivity!: string;

  @ApiProperty({ example: 'PUBLIC' })
  @IsString({ message: 'Required field target.exposure is missing' })
  @IsNotEmpty({ message: 'Required field target.exposure is missing' })
  exposure!: string;
}

export class TimelineInputDto {
  @ApiProperty({ example: '2026-09-19T01:02:00Z' })
  @IsISO8601({}, { message: 'Required field timeline.startTime must be an ISO-8601 timestamp' })
  startTime!: string;

  @ApiProperty({ example: '2026-09-19T01:06:00Z' })
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

export class MetadataInputDto {
  @ApiProperty({ example: 14 })
  @IsNumber({}, { message: 'Required field metadata.blockedCount is missing' })
  @Min(0)
  blockedCount!: number;

  @ApiProperty({ example: 2 })
  @IsNumber({}, { message: 'Required field metadata.nonBlockedCount is missing' })
  @Min(0)
  nonBlockedCount!: number;

  @ApiProperty({ example: 16 })
  @IsNumber({}, { message: 'Required field metadata.wafEventCount is missing' })
  @Min(0)
  wafEventCount!: number;
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

  @ApiProperty({ example: '2026-09-19T01:02:12Z' })
  @IsISO8601({}, { message: 'Required field representativeEvents.occurredAt must be an ISO-8601 timestamp' })
  occurredAt!: string;

  @ApiProperty({ example: '/api/search' })
  @IsString({ message: 'Required field representativeEvents.path is missing' })
  @IsNotEmpty({ message: 'Required field representativeEvents.path is missing' })
  path!: string;

  @ApiProperty({ example: 'BLOCKED' })
  @IsString({ message: 'Required field representativeEvents.action is missing' })
  @IsNotEmpty({ message: 'Required field representativeEvents.action is missing' })
  action!: string;

  @ApiProperty({ example: 'WAF_XSS' })
  @IsString({ message: 'Required field representativeEvents.signal is missing' })
  @IsNotEmpty({ message: 'Required field representativeEvents.signal is missing' })
  signal!: string;
}

export class AnalyzeClusterDto {
  @ApiProperty({ type: ClusterInputDto })
  @IsDefined({ message: 'Required field cluster is missing' })
  @ValidateNested()
  @Type(() => ClusterInputDto)
  cluster!: ClusterInputDto;

  @ApiProperty({ type: TargetInputDto })
  @IsDefined({ message: 'Required field target is missing' })
  @ValidateNested()
  @Type(() => TargetInputDto)
  target!: TargetInputDto;

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

  @ApiProperty({ type: [String], example: ['WAF_XSS'] })
  @IsArray({ message: 'Required field signals is missing' })
  @IsString({ each: true })
  signals!: string[];

  @ApiProperty({
    type: [String],
    example: ['5 unique IP addresses', '16 XSS-related WAF events', '14 blocked by WAF', '2 not blocked by WAF'],
  })
  @IsArray({ message: 'Required field evidence is missing' })
  @IsString({ each: true })
  @ArrayMaxSize(50)
  evidence!: string[];

  @ApiProperty({ type: MetadataInputDto })
  @IsDefined({ message: 'Required field metadata is missing' })
  @ValidateNested()
  @Type(() => MetadataInputDto)
  metadata!: MetadataInputDto;

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
  @ArrayMaxSize(20)
  representativeEvents?: RepresentativeEventDto[];
}
