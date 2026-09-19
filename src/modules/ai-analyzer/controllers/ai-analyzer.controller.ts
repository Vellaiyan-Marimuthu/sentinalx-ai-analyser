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
import { XSS_ANALYZE_EXAMPLE } from '../dto/analyze-examples';
import { AnalyzeResponseDto, ErrorResponseDto } from '../dto/analyze-response.dto';
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
    summary: 'Analyze by cluster path (compatibility)',
    description: 'Same contract as POST /analyze. Prefer POST /api/v1/analyze.',
  })
  @ApiParam({ name: 'clusterId', example: 'cluster-uuid' })
  @ApiBody({ type: AnalyzeClusterDto, examples: { xss: { value: XSS_ANALYZE_EXAMPLE } } })
  @ApiResponse({ status: 200, type: AnalyzeResponseDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  analyze(
    @Param('clusterId') clusterId: string,
    @Body() payload: AnalyzeClusterDto,
    @Req() request: AuthenticatedRequest,
  ) {
    payload.cluster.id = payload.cluster.id || clusterId;
    return this.aiAnalyzerService.analyze(request.applicationId, payload);
  }

  @Get(':clusterId')
  @ApiOperation({ summary: 'Get the latest analysis for a cluster' })
  @ApiParam({ name: 'clusterId', example: 'cluster-uuid' })
  @ApiResponse({ status: 200, type: AnalyzeResponseDto })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  @ApiResponse({ status: 404, type: ErrorResponseDto })
  getLatest(@Param('clusterId') clusterId: string, @Req() request: AuthenticatedRequest) {
    return this.aiAnalyzerService.getLatest(clusterId, request.applicationId);
  }

  @Post(':clusterId/reanalyze')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Reanalyze a cluster',
    description: 'Uses a new payload or the last stored snapshot.',
  })
  @ApiParam({ name: 'clusterId', example: 'cluster-uuid' })
  @ApiBody({ type: AnalyzeClusterDto, required: false })
  @ApiResponse({ status: 200, type: AnalyzeResponseDto })
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
