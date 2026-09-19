import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  AnalysisNotFoundException,
  InvalidAnalysisRequestException,
} from '../../../common/exceptions/analyzer.exceptions';
import { AnalyzeClusterDto } from '../dto/analyze-cluster.dto';
import { AiAnalysisEntity } from '../entities/ai-analysis.entity';
import { AiAnalysisStatus } from '../enums/ai-analysis-status.enum';
import { AIAnalysisApiResponse } from '../types/ai-analysis-result';
import { AIAnalysisContext } from '../types/ai-analysis-context';
import { AiContextBuilderService } from './ai-context-builder.service';
import { AiProviderService } from './ai-provider.service';

const FALLBACK_MESSAGE =
  'AI analysis unavailable. Deterministic attack story remains available.';

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
    clusterId: string,
    applicationId: string,
    payload: AnalyzeClusterDto,
  ): Promise<AIAnalysisApiResponse> {
    const context = this.contextBuilder.build(clusterId, applicationId, payload);
    return this.runAnalysis(context);
  }

  async reanalyze(
    clusterId: string,
    applicationId: string,
    payload?: AnalyzeClusterDto,
  ): Promise<AIAnalysisApiResponse> {
    if (payload) {
      return this.analyze(clusterId, applicationId, payload);
    }

    const previous = await this.findLatest(clusterId, applicationId);
    if (!previous?.inputSnapshot) {
      throw new InvalidAnalysisRequestException(
        'No stored Attack Cluster context exists for reanalysis. Submit the cluster payload.',
      );
    }

    return this.runAnalysis(previous.inputSnapshot);
  }

  async getLatest(clusterId: string, applicationId: string): Promise<AIAnalysisApiResponse> {
    const latest = await this.findLatest(clusterId, applicationId);
    if (!latest) {
      throw new AnalysisNotFoundException(clusterId);
    }
    return toApiResponse(latest);
  }

  private async runAnalysis(context: AIAnalysisContext): Promise<AIAnalysisApiResponse> {
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
      if (context.eventsTruncated) {
        analysis.limitations = [
          ...analysis.limitations,
          'Representative events were limited before being sent to the model.',
        ];
      }

      record.status = AiAnalysisStatus.COMPLETED;
      record.model = this.configService.get<string>('ai.model') ?? record.model;
      record.executiveSummary = analysis.executiveSummary;
      record.whatHappened = analysis.whatHappened;
      record.whyItMatters = analysis.whyItMatters;
      record.evidenceAssessment = analysis.evidenceAssessment;
      record.investigation = analysis.investigation;
      record.recommendations = analysis.recommendations;
      record.limitations = analysis.limitations;
      record.outputSnapshot = analysis;
      await this.analyses.save(record);
    } catch (error) {
      this.logger.error(
        `AI analysis failed for cluster ${context.cluster.id}: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
      record.status = AiAnalysisStatus.FAILED;
      await this.analyses.save(record);
    }

    return toApiResponse(record);
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

function toApiResponse(record: AiAnalysisEntity): AIAnalysisApiResponse {
  if (record.status !== AiAnalysisStatus.COMPLETED) {
    return {
      id: record.id,
      clusterId: record.clusterId,
      status: record.status,
      analysis: null,
      fallback: { message: FALLBACK_MESSAGE },
    };
  }

  return {
    id: record.id,
    clusterId: record.clusterId,
    status: record.status,
    analysis: {
      executiveSummary: record.executiveSummary ?? '',
      whatHappened: record.whatHappened ?? '',
      whyItMatters: record.whyItMatters ?? '',
      evidenceAssessment: record.evidenceAssessment ?? [],
      investigation: record.investigation ?? [],
      recommendations: record.recommendations ?? [],
      limitations: record.limitations ?? [],
    },
  };
}
