import { Body, Controller, HttpCode, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBody, ApiOperation, ApiResponse, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
  ApplicationApiKeyGuard,
  AuthenticatedRequest,
} from '../../../common/guards/application-api-key.guard';
import { AnalyzeClusterDto } from '../dto/analyze-cluster.dto';
import { SQLI_ANALYZE_EXAMPLE, XSS_ANALYZE_EXAMPLE } from '../dto/analyze-examples';
import { AnalyzeResponseDto, ErrorResponseDto } from '../dto/analyze-response.dto';
import { AiAnalyzerService } from '../services/ai-analyzer.service';

@ApiTags('AI Analyzer')
@ApiSecurity('api-key')
@Controller()
@UseGuards(ApplicationApiKeyGuard)
export class AnalyzeController {
  constructor(private readonly aiAnalyzerService: AiAnalyzerService) {}

  @Post('analyze')
  @HttpCode(200)
  @ApiOperation({
    summary: 'Analyze a correlated Attack Cluster',
    description:
      'Receives a sanitized AiAttackContext from SentinelX and returns explanation, risk, investigation steps, and an advisory policy. Does not detect attacks or change deterministic severity, confidence, or counts.',
  })
  @ApiBody({
    type: AnalyzeClusterDto,
    examples: {
      xss: {
        summary: 'XSS campaign',
        value: XSS_ANALYZE_EXAMPLE,
      },
      sqli: {
        summary: 'SQL injection campaign',
        value: SQLI_ANALYZE_EXAMPLE,
      },
    },
  })
  @ApiResponse({ status: 200, type: AnalyzeResponseDto })
  @ApiResponse({ status: 400, type: ErrorResponseDto })
  @ApiResponse({ status: 401, type: ErrorResponseDto })
  @ApiResponse({ status: 502, type: ErrorResponseDto })
  @ApiResponse({ status: 504, type: ErrorResponseDto })
  analyze(@Body() payload: AnalyzeClusterDto, @Req() request: AuthenticatedRequest) {
    return this.aiAnalyzerService.analyze(request.applicationId, payload);
  }
}
