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

export class ClusterDto {
  @IsString({ message: 'Required field cluster.type is missing' })
  @IsNotEmpty({ message: 'Required field cluster.type is missing' })
  type!: string;

  @IsString({ message: 'Required field cluster.severity is missing' })
  @IsNotEmpty({ message: 'Required field cluster.severity is missing' })
  @IsIn(SEVERITIES, { message: 'cluster.severity must be one of LOW, MEDIUM, HIGH, CRITICAL' })
  severity!: (typeof SEVERITIES)[number];

  @IsNumber({}, { message: 'Required field cluster.confidence is missing' })
  @Min(0)
  @Max(1)
  confidence!: number;

  @IsISO8601({}, { message: 'Required field cluster.startTime must be an ISO-8601 timestamp' })
  startTime!: string;

  @IsISO8601({}, { message: 'Required field cluster.endTime must be an ISO-8601 timestamp' })
  endTime!: string;

  @IsNumber({}, { message: 'Required field cluster.requestCount is missing' })
  @Min(0)
  requestCount!: number;

  @IsNumber({}, { message: 'Required field cluster.ipCount is missing' })
  @Min(0)
  ipCount!: number;

  @IsNumber({}, { message: 'Required field cluster.userCount is missing' })
  @Min(0)
  userCount!: number;

  @IsString({ message: 'Required field cluster.targetApi is missing' })
  @IsNotEmpty({ message: 'Required field cluster.targetApi is missing' })
  targetApi!: string;

  @IsArray({ message: 'Required field cluster.signals is missing' })
  @IsString({ each: true })
  signals!: string[];
}

export class ApiContextDto {
  @IsString({ message: 'Required field apiContext.method is missing' })
  @IsNotEmpty({ message: 'Required field apiContext.method is missing' })
  method!: string;

  @IsString({ message: 'Required field apiContext.operationType is missing' })
  @IsNotEmpty({ message: 'Required field apiContext.operationType is missing' })
  operationType!: string;

  @IsString({ message: 'Required field apiContext.sensitivity is missing' })
  @IsNotEmpty({ message: 'Required field apiContext.sensitivity is missing' })
  sensitivity!: string;

  @IsString({ message: 'Required field apiContext.exposure is missing' })
  @IsNotEmpty({ message: 'Required field apiContext.exposure is missing' })
  exposure!: string;
}

export class WafEvidenceDto {
  @IsNumber({}, { message: 'Required field wafEvidence.eventCount is missing' })
  @Min(0)
  eventCount!: number;

  @IsNumber({}, { message: 'Required field wafEvidence.blockedCount is missing' })
  @Min(0)
  blockedCount!: number;

  @IsNumber({}, { message: 'Required field wafEvidence.nonBlockedCount is missing' })
  @Min(0)
  nonBlockedCount!: number;

  @IsArray({ message: 'Required field wafEvidence.ruleIds is missing' })
  @IsString({ each: true })
  ruleIds!: string[];

  @IsArray({ message: 'Required field wafEvidence.labels is missing' })
  @IsString({ each: true })
  labels!: string[];
}

export class AgentEvidenceDto {
  @IsNumber({}, { message: 'Required field agentEvidence.eventCount is missing' })
  @Min(0)
  eventCount!: number;

  @IsArray({ message: 'Required field agentEvidence.violations is missing' })
  @IsString({ each: true })
  violations!: string[];
}

export class AnalyzeIncidentDto {
  @IsOptional()
  @IsString()
  clusterId?: string;

  @IsOptional()
  @IsString()
  applicationId?: string;

  @IsDefined({ message: 'Required field cluster is missing' })
  @ValidateNested()
  @Type(() => ClusterDto)
  cluster!: ClusterDto;

  @IsDefined({ message: 'Required field apiContext is missing' })
  @ValidateNested()
  @Type(() => ApiContextDto)
  apiContext!: ApiContextDto;

  @IsDefined({ message: 'Required field wafEvidence is missing' })
  @ValidateNested()
  @Type(() => WafEvidenceDto)
  wafEvidence!: WafEvidenceDto;

  @IsDefined({ message: 'Required field agentEvidence is missing' })
  @ValidateNested()
  @Type(() => AgentEvidenceDto)
  agentEvidence!: AgentEvidenceDto;

  @IsArray({ message: 'Required field correlationEvidence is missing' })
  @ArrayMaxSize(50, { message: 'correlationEvidence cannot contain more than 50 items' })
  @IsString({ each: true })
  correlationEvidence!: string[];

  @IsString({ message: 'Required field deterministicStory is missing' })
  @IsNotEmpty({ message: 'Required field deterministicStory is missing' })
  deterministicStory!: string;
}

export function resolveClusterId(incident: AnalyzeIncidentDto): string {
  if (incident.clusterId) {
    return incident.clusterId;
  }

  return `${incident.cluster.type}_${incident.cluster.startTime}`;
}
