import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AiAnalyzerController } from './controllers/ai-analyzer.controller';
import { AnalyzeController } from './controllers/analyze.controller';
import { AiAnalysisEntity } from './entities/ai-analysis.entity';
import { CreateAiAnalyses1726740000000 } from './migrations/1726740000000-CreateAiAnalyses';
import { AiAnalyzerService } from './services/ai-analyzer.service';
import { AiContextBuilderService } from './services/ai-context-builder.service';
import { AiProviderService } from './services/ai-provider.service';
import { AiResponseParserService } from './services/ai-response-parser.service';
import { AiSanitizerService } from './services/ai-sanitizer.service';
import { OpenAIProvider } from './services/openai.provider';
import { AI_PROVIDER } from './types/ai-provider';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'better-sqlite3',
        database: configService.get<string>('database.path') ?? 'data/sentinelx.sqlite',
        entities: [AiAnalysisEntity],
        migrations: [CreateAiAnalyses1726740000000],
        migrationsRun: true,
        synchronize: false,
      }),
    }),
    TypeOrmModule.forFeature([AiAnalysisEntity]),
  ],
  controllers: [AnalyzeController, AiAnalyzerController],
  providers: [
    AiAnalyzerService,
    AiContextBuilderService,
    AiProviderService,
    AiResponseParserService,
    AiSanitizerService,
    OpenAIProvider,
    {
      provide: AI_PROVIDER,
      useExisting: OpenAIProvider,
    },
  ],
})
export class AiAnalyzerModule {}
