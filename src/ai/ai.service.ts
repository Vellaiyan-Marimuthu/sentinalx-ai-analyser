import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ZodError } from 'zod';
import { AnalyzeIncidentDto, resolveClusterId } from './dto/analyze-incident.dto';
import { AnalyzeSuccessResponse, IncidentAnalysis } from './dto/analyze-response.dto';
import { OmniClient } from './clients/omni.client';
import { mapIncidentToContext } from './mappers/incident-context.mapper';
import {
  SECURITY_ANALYSIS_SYSTEM_PROMPT,
  buildUserPrompt,
} from './prompts/security-analysis.prompt';
import { validateAiAnalysis } from './schemas/ai-analysis.schema';
import {
  AiAnalysisTimeoutException,
  AiProviderException,
  InvalidAiResponseException,
  OmniProviderError,
  OmniTimeoutError,
} from '../common/exceptions/analyzer.exceptions';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);

  constructor(
    private readonly omniClient: OmniClient,
    private readonly configService: ConfigService,
  ) {}

  async analyze(incident: AnalyzeIncidentDto): Promise<AnalyzeSuccessResponse> {
    const startedAt = Date.now();
    const provider = (this.configService.get<string>('aiProvider') ?? 'openai').toLowerCase();
    const clusterId = resolveClusterId(incident);
    const { promptText } = mapIncidentToContext(incident);
    const userPrompt = buildUserPrompt(promptText);

    this.logger.log(
      `Analyzing cluster ${clusterId} type=${incident.cluster.type} provider=${provider}`,
    );

    const { analysis, model } =
      provider === 'mock'
        ? { analysis: buildMockAnalysis(incident), model: 'mock' }
        : await this.analyzeWithOmni(userPrompt);

    return {
      success: true,
      clusterId,
      analysis,
      metadata: {
        model,
        analyzedAt: new Date().toISOString(),
        analysisVersion: this.configService.get<string>('analysisVersion') ?? '1.0',
        latencyMs: Date.now() - startedAt,
      },
    };
  }

  private async analyzeWithOmni(
    userPrompt: string,
  ): Promise<{ analysis: IncidentAnalysis; model: string }> {
    try {
      const completion = await this.omniClient.complete(
        SECURITY_ANALYSIS_SYSTEM_PROMPT,
        userPrompt,
      );
      return {
        analysis: parseAndValidateAnalysis(completion.content),
        model: completion.model,
      };
    } catch (error) {
      if (error instanceof InvalidAiResponseException) {
        throw error;
      }
      if (error instanceof OmniTimeoutError) {
        throw new AiAnalysisTimeoutException();
      }
      if (error instanceof OmniProviderError) {
        throw new AiProviderException(error.message);
      }
      throw new AiProviderException();
    }
  }
}

function parseAndValidateAnalysis(raw: string): IncidentAnalysis {
  let parsed: unknown;

  try {
    parsed = JSON.parse(stripMarkdownFence(raw));
  } catch {
    throw new InvalidAiResponseException('AI provider returned malformed JSON');
  }

  try {
    return validateAiAnalysis(parsed);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new InvalidAiResponseException('AI provider returned a schema-invalid analysis');
    }
    throw new InvalidAiResponseException(
      error instanceof Error ? error.message : 'AI provider returned an invalid analysis payload',
    );
  }
}

function stripMarkdownFence(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}

function buildMockAnalysis(incident: AnalyzeIncidentDto): IncidentAnalysis {
  const { cluster, apiContext, wafEvidence, agentEvidence } = incident;
  const recommendationType = cluster.signals.includes('WAF_XSS') ? 'WAF_RULE' : 'API_PROTECTION';

  return {
    summary: `${humanize(cluster.type)} activity was correlated against ${apiContext.method} ${cluster.targetApi}.`,
    whatHappened: [
      incident.deterministicStory,
      `${cluster.requestCount} requests were observed from ${cluster.ipCount} unique IP addresses.`,
      `${wafEvidence.eventCount} WAF events were supplied; ${wafEvidence.blockedCount} were blocked and ${wafEvidence.nonBlockedCount} were not blocked.`,
    ],
    whyItMatters: [
      `The activity targets a ${apiContext.sensitivity.toLowerCase()}-sensitivity ${apiContext.operationType.toLowerCase()} endpoint with ${apiContext.exposure.toLowerCase()} exposure.`,
      `Deterministic cluster confidence is ${Math.round(cluster.confidence * 100)}% based on supplied counts and signals. This service does not change that score.`,
    ],
    potentialImpact: [
      'Possible attempts to inject script into a public search endpoint.',
      'Non-blocked requests could indicate residual XSS exposure if the application reflects unsanitized input.',
      'Evidence does not confirm successful exploitation or data compromise.',
    ],
    investigationSteps: [
      `Review the ${wafEvidence.nonBlockedCount} non-blocked requests against ${cluster.targetApi} and determine whether input was reflected.`,
      `Inspect AWS WAF rule matches for ${wafEvidence.ruleIds.join(', ') || 'the supplied rule IDs'} and labels ${wafEvidence.labels.join(', ') || 'none supplied'}.`,
      `Review subsequent activity from the ${cluster.ipCount} source IPs after the detected window.`,
      `Check whether ${cluster.targetApi} encodes or sanitizes query parameters.`,
      ...(agentEvidence.eventCount === 0
        ? ['Note that no SentinelX agent violations were supplied for this cluster.']
        : ['Review supplied agent violations alongside the WAF events.']),
    ],
    recommendations: [
      {
        type: recommendationType,
        target: cluster.targetApi,
        suggestion: `Consider tightening WAF XSS inspection and output encoding for ${cluster.targetApi}.`,
      },
    ],
    suggestedPolicy: {
      type: recommendationType,
      api: cluster.targetApi,
      parameters: {
        ruleSet: wafEvidence.ruleIds[0] ?? 'AWS-AWSManagedRulesCommonRuleSet',
        action: 'BLOCK',
        scope: 'API',
      },
      reason: 'Distributed XSS-related WAF activity was observed against a public search API.',
    },
    limitations: [
      'The supplied evidence does not confirm successful XSS exploitation.',
      'No individual source IPs, users, or raw request bodies were included in this cluster.',
      ...(agentEvidence.eventCount === 0
        ? ['No SentinelX agent evidence was supplied.']
        : []),
    ],
  };
}

function humanize(value: string): string {
  return value
    .toLowerCase()
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}
