import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AiAnalysisTimeoutException,
  AiProviderError,
  AiProviderException,
  AiTimeoutError,
  AnalysisNotFoundException,
  InvalidAiResponseException,
  InvalidAnalysisRequestException,
} from '../../../common/exceptions/analyzer.exceptions';
import { AnalyzeClusterDto } from '../dto/analyze-cluster.dto';
import { AiAnalysisEntity } from '../entities/ai-analysis.entity';
import { AiAnalysisStatus } from '../enums/ai-analysis-status.enum';
import { AIAnalysisResult } from '../types/ai-analysis-result';
import { AIAnalysisContext } from '../types/ai-analysis-context';
import { AiContextBuilderService } from './ai-context-builder.service';
import { AiProviderService } from './ai-provider.service';

@Injectable()
export class AiAnalyzerService {
  private readonly logger = new Logger(AiAnalyzerService.name);

  constructor(
    @InjectRepository(AiAnalysisEntity)
    private readonly analyses: Repository<AiAnalysisEntity>,
    private readonly contextBuilder: AiContextBuilderService,
    private readonly aiProvider: AiProviderService,
    private readonly configService: ConfigService,
  ) {}

  async analyze(
    applicationId: string,
    payload: AnalyzeClusterDto,
  ): Promise<AIAnalysisResult> {
    const context = this.contextBuilder.build(applicationId, payload);
    return this.runAnalysis(context);
  }

  async reanalyze(
    clusterId: string,
    applicationId: string,
    payload?: AnalyzeClusterDto,
  ): Promise<AIAnalysisResult> {
    if (payload) {
      return this.analyze(applicationId, payload);
    }

    const previous = await this.findLatest(clusterId, applicationId);
    if (!previous?.inputSnapshot) {
      throw new InvalidAnalysisRequestException(
        'No stored Attack Cluster context exists for reanalysis. Submit the cluster payload.',
      );
    }

    return this.runAnalysis(previous.inputSnapshot);
  }

  async getLatest(clusterId: string, applicationId: string): Promise<AIAnalysisResult> {
    const latest = await this.findLatest(clusterId, applicationId);
    if (!latest) {
      throw new AnalysisNotFoundException(clusterId);
    }
    if (latest.status !== AiAnalysisStatus.COMPLETED || !latest.outputSnapshot) {
      throw new AiProviderException(
        'Latest AI analysis is unavailable. Deterministic attack story remains available on SentinelX.',
      );
    }
    return latest.outputSnapshot;
  }

  private async runAnalysis(context: AIAnalysisContext): Promise<AIAnalysisResult> {
    const provider = this.configService.get<string>('ai.provider') ?? 'openai';
    const model = this.configService.get<string>('ai.model') ?? 'gpt-4o';
    const promptVersion = this.configService.get<string>('ai.promptVersion') ?? '1.0';

    const record = this.analyses.create({
      applicationId: context.applicationId,
      clusterId: context.cluster.id,
      status: AiAnalysisStatus.PENDING,
      provider,
      model,
      promptVersion,
      inputSnapshot: context,
    });
    await this.analyses.save(record);

    record.status = AiAnalysisStatus.PROCESSING;
    await this.analyses.save(record);

    this.logger.log(
      `Analyzing cluster ${context.cluster.id} type=${context.cluster.type} provider=${provider}`,
    );

    try {
      const analysis = await this.aiProvider.analyze(context);
      record.status = AiAnalysisStatus.COMPLETED;
      record.executiveSummary = analysis.executiveSummary;
      record.attackExplanation = analysis.attackExplanation;
      record.riskExplanation = analysis.riskExplanation;
      record.investigationSteps = analysis.investigationSteps;
      record.recommendations = analysis.recommendations;
      record.outputSnapshot = analysis;
      await this.analyses.save(record);
      return analysis;
    } catch (error) {
      this.logger.error(
        `AI analysis failed for cluster ${context.cluster.id}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      record.status = AiAnalysisStatus.FAILED;
      await this.analyses.save(record);
      throw toHttpError(error);
    }
  }

  private findLatest(
    clusterId: string,
    applicationId: string,
  ): Promise<AiAnalysisEntity | null> {
    return this.analyses.findOne({
      where: { clusterId, applicationId },
      order: { createdAt: 'DESC' },
    });
  }
}

function toHttpError(error: unknown): Error {
  if (error instanceof AiTimeoutError) {
    return new AiAnalysisTimeoutException();
  }
  if (error instanceof AiProviderError) {
    return new AiProviderException(error.message);
  }
  if (error instanceof Error && /malformed JSON|schema-invalid|invalid analysis/i.test(error.message)) {
    return new InvalidAiResponseException(error.message);
  }
  return new AiProviderException(
    error instanceof Error ? error.message : 'AI analysis provider unavailable',
  );
}
