import { Controller, Get } from '@nestjs/common';

@Controller('health')
export class HealthController {
  @Get()
  check() {
    return {
      success: true,
      service: 'sentinelx-ai-analyzer',
      status: 'ok',
    };
  }
}
