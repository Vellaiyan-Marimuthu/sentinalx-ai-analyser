import { Body, Controller, HttpCode, Post, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { AnalyzeIncidentDto } from './dto/analyze-incident.dto';
import { AnalyzeSuccessResponse } from './dto/analyze-response.dto';
import { InternalServiceGuard } from '../common/guards/internal-service.guard';

@Controller('ai')
@UseGuards(InternalServiceGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('analyze')
  @HttpCode(200)
  analyze(@Body() incident: AnalyzeIncidentDto): Promise<AnalyzeSuccessResponse> {
    return this.aiService.analyze(incident);
  }
}
