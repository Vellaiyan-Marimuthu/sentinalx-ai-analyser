import { Module } from '@nestjs/common';
import { AiController } from './ai.controller';
import { AiService } from './ai.service';
import { OmniClient } from './clients/omni.client';

@Module({
  controllers: [AiController],
  providers: [AiService, OmniClient],
  exports: [AiService],
})
export class AiModule {}
