import { Body, Controller, Get, HttpCode, Param, Post, Req, UseGuards } from '@nestjs/common';
import {
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiResponse,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { InvalidAnalysisRequestException } from '../../../common/exceptions/analyzer.exceptions';
import {
  ApplicationApiKeyGuard,
  AuthenticatedRequest,
} from '../../../common/guards/application-api-key.guard';
import { AnalyzeClusterDto } from '../dto/analyze-cluster.dto';
import { AnalysisApiResponseDto, ErrorResponseDto } from '../dto/analyze-response.dto';
import { AiAnalyzerService } from '../services/ai-analyzer.service';

@ApiTags('AI Analyzer')
@ApiSecurity('api-key')
@Controller('ai-analyzer/clusters')
@UseGuards(ApplicationApiKeyGuard)
export class AiAnalyzerController {
  constructor(private readonly aiAnalyzerService: AiAnalyzerService) {}

  @Post(':clusterId/analyze')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Analyze an Attack Cluster',
    description:
      'Builds a controlled AI context from the persisted cluster evidence and returns a structured investigation analysis. Does not change severity, confidence, or enforce policy.',
  })
  @ApiParam({ name: 'clusterId', example: 'cluster-uuid' })
  @ApiBody({ type: AnalyzeClusterDto })
  @ApiResponse({ status: 200, type: AnalysisApiResponseDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  analyze(
    @Param('clusterId') clusterId: string,
    @Body() payload: AnalyzeClusterDto,
    @Req() request: AuthenticatedRequest,
  ) {
    return this.aiAnalyzerService.analyze(clusterId, request.applicationId, payload);
  }

  @Get(':clusterId')
  @ApiOperation({
    summary: 'Get the latest analysis',
    description: 'Returns the most recent AI analysis for the cluster, scoped by applicationId.',
  })
  @ApiParam({ name: 'clusterId', example: 'cluster-uuid' })
  @ApiResponse({ status: 200, type: AnalysisApiResponseDto })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  getLatest(@Param('clusterId') clusterId: string, @Req() request: AuthenticatedRequest) {
    return this.aiAnalyzerService.getLatest(clusterId, request.applicationId);
  }

  @Post(':clusterId/reanalyze')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Reanalyze a cluster',
    description:
      'Regenerates analysis from a new payload, or from the last stored cluster snapshot if no body is sent.',
  })
  @ApiParam({ name: 'clusterId', example: 'cluster-uuid' })
  @ApiBody({ type: AnalyzeClusterDto, required: false })
  @ApiResponse({ status: 200, type: AnalysisApiResponseDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  async reanalyze(
    @Param('clusterId') clusterId: string,
    @Body() payload: Record<string, unknown> = {},
    @Req() request: AuthenticatedRequest,
  ) {
    const dto = await optionalAnalyzePayload(payload);
    return this.aiAnalyzerService.reanalyze(clusterId, request.applicationId, dto);
  }
}

async function optionalAnalyzePayload(
  payload: Record<string, unknown> | undefined,
): Promise<AnalyzeClusterDto | undefined> {
  if (!payload || typeof payload !== 'object' || !payload.cluster) {
    return undefined;
  }

  const dto = plainToInstance(AnalyzeClusterDto, payload);
  const errors = await validate(dto);
  if (errors.length) {
    const message = Object.values(errors[0].constraints ?? {})[0] ?? 'Invalid analysis request';
    throw new InvalidAnalysisRequestException(message);
  }

  return dto;
}
