import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AnalyzeClusterDto } from '../dto/analyze-cluster.dto';
import { AIAnalysisContext } from '../types/ai-analysis-context';
import { AiSanitizerService } from './ai-sanitizer.service';

@Injectable()
export class AiContextBuilderService {
  constructor(
    private readonly sanitizer: AiSanitizerService,
    private readonly configService: ConfigService,
  ) {}

  build(applicationId: string, payload: AnalyzeClusterDto): AIAnalysisContext {
    const maxEvents = this.configService.get<number>('ai.maxRepresentativeEvents') ?? 10;
    const safePayload = this.sanitizer.sanitize(payload);
    const events = safePayload.representativeEvents ?? [];
    const representativeEvents = events.slice(0, maxEvents).map((event) => ({
      source: event.source,
      occurredAt: event.occurredAt,
      method: event.method,
      path: event.path,
      action: event.action,
      signal: event.signal,
      wafRuleId: event.wafRuleId,
    }));

    return {
      cluster: {
        id: safePayload.cluster.id,
        type: safePayload.cluster.type,
        severity: safePayload.cluster.severity,
        confidence: safePayload.cluster.confidence,
        status: safePayload.cluster.status,
      },
      target: {
        apiId: safePayload.target?.apiId,
        method: safePayload.target?.method,
        api: safePayload.target?.api,
        operationType: safePayload.target?.operationType,
        sensitivity: safePayload.target?.sensitivity,
        exposure: safePayload.target?.exposure,
      },
      timeline: {
        startTime: safePayload.timeline.startTime,
        endTime: safePayload.timeline.endTime,
      },
      metrics: {
        requestCount: safePayload.metrics.requestCount,
        ipCount: safePayload.metrics.ipCount,
        userCount: safePayload.metrics.userCount,
        apiCount: safePayload.metrics.apiCount,
      },
      sourceBreakdown: {
        agentEventCount: safePayload.sourceBreakdown.agentEventCount,
        wafEventCount: safePayload.sourceBreakdown.wafEventCount,
      },
      signals: safePayload.signals,
      evidence: safePayload.evidence,
      metadata: {
        blockedCount: safePayload.metadata?.blockedCount,
        nonBlockedCount: safePayload.metadata?.nonBlockedCount,
        wafEventCount: safePayload.metadata?.wafEventCount,
      },
      attackStory: {
        headline: safePayload.attackStory.headline,
        summary: safePayload.attackStory.summary,
        timelineSummary: safePayload.attackStory.timelineSummary ?? '',
        evidenceSummary: safePayload.attackStory.evidenceSummary ?? [],
        recommendedInvestigation: safePayload.attackStory.recommendedInvestigation ?? [],
      },
      representativeEvents,
      applicationId,
      eventsTruncated: events.length > maxEvents,
    };
  }
}
