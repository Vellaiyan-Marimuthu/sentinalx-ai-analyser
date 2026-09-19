import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { HealthResponseDto } from '../modules/ai-analyzer/dto/analyze-response.dto';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOperation({ summary: 'Service health check' })
  @ApiResponse({ status: 200, type: HealthResponseDto })
  check() {
    return {
      success: true,
      service: 'sentinelx-ai-analyzer',
      status: 'ok',
    };
  }
}
