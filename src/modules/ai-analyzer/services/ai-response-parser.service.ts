import { Injectable } from '@nestjs/common';
import { z, ZodError } from 'zod';
import { AIAnalysisResult, SuggestedPolicy } from '../types/ai-analysis-result';

const policySchema = z
  .object({
    type: z.enum(['RATE_LIMIT', 'BLOCK_IP', 'CHALLENGE', 'ALERT']).nullable(),
    scope: z.string().optional(),
    reason: z.string().optional(),
  })
  .nullable();

const analysisSchema = z.object({
  executiveSummary: z.string().min(1),
  attackExplanation: z.string().min(1),
  riskExplanation: z.string().min(1),
  investigationSteps: z.array(z.string().min(1)).min(1),
  recommendations: z.array(z.string().min(1)).min(1),
  suggestedPolicy: policySchema.optional(),
});

const EXECUTION_CLAIM =
  /\b(i (have|just) (blocked|deployed|executed|enforced)|automatically (blocked|deployed)|waf rule (was|has been) (deployed|applied))\b/i;

const IPV4 = /^\d{1,3}(\.\d{1,3}){3}$/;

@Injectable()
export class AiResponseParserService {
  parse(raw: string): AIAnalysisResult {
    let parsed: unknown;

    try {
      parsed = JSON.parse(stripMarkdownFence(raw));
    } catch {
      throw new Error('AI provider returned malformed JSON');
    }

    try {
      const result = analysisSchema.parse(parsed);
      const blob = JSON.stringify(result);

      if (/"executed"\s*:\s*true/i.test(blob) || /"deployed"\s*:\s*true/i.test(blob)) {
        throw new Error('AI response attempted to mark a recommendation as executed');
      }

      if (EXECUTION_CLAIM.test(blob)) {
        throw new Error('AI response claimed to execute a security action');
      }

      return {
        executiveSummary: result.executiveSummary,
        attackExplanation: result.attackExplanation,
        riskExplanation: result.riskExplanation,
        investigationSteps: result.investigationSteps,
        recommendations: result.recommendations,
        suggestedPolicy: sanitizeSuggestedPolicy(result.suggestedPolicy ?? null),
      };
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error('AI provider returned a schema-invalid analysis');
      }
      throw error;
    }
  }
}

function sanitizeSuggestedPolicy(policy: SuggestedPolicy | null): SuggestedPolicy | null {
  if (!policy || !policy.type) {
    return policy?.type === null ? { type: null, scope: policy.scope, reason: policy.reason } : null;
  }

  if (policy.type === 'BLOCK_IP' && policy.scope && looksLikeIp(policy.scope)) {
    return {
      type: 'ALERT',
      reason:
        'A block-IP policy was not proposed because raw IP addresses are not supplied to the analyzer.',
    };
  }

  return policy;
}

function looksLikeIp(value: string): boolean {
  return IPV4.test(value) || value.includes(':');
}

function stripMarkdownFence(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}
