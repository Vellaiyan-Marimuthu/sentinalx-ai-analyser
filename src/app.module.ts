import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { HealthController } from './health/health.controller';
import { AiAnalyzerModule } from './modules/ai-analyzer/ai-analyzer.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
      load: [configuration],
    }),
    AiAnalyzerModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
