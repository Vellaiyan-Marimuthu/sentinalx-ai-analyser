import { Injectable } from '@nestjs/common';
import { z, ZodError } from 'zod';
import { AIAnalysisResult } from '../types/ai-analysis-result';

const analysisSchema = z.object({
  analysisVersion: z.string().min(1).optional(),
  executiveSummary: z.string().min(1),
  whatHappened: z.string().min(1),
  whyItMatters: z.string().min(1),
  evidenceAssessment: z
    .array(
      z.object({
        fact: z.string().min(1),
        interpretation: z.string().min(1),
      }),
    )
    .min(1),
  investigation: z
    .array(
      z.object({
        priority: z.string().min(1),
        action: z.string().min(1),
        reason: z.string().min(1),
      }),
    )
    .min(1),
  recommendations: z.array(
    z.object({
      type: z.string().min(1),
      target: z.string().min(1),
      reason: z.string().min(1),
      confidence: z.number().min(0).max(1).optional(),
    }),
  ),
  limitations: z.array(z.string()),
  generatedAt: z.string().optional(),
});

const EXECUTION_CLAIM =
  /\b(i (have|just) (blocked|deployed|executed|enforced)|automatically (blocked|deployed)|waf rule (was|has been) (deployed|applied))\b/i;

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
        analysisVersion: result.analysisVersion ?? '1.0',
        executiveSummary: result.executiveSummary,
        whatHappened: result.whatHappened,
        whyItMatters: result.whyItMatters,
        evidenceAssessment: result.evidenceAssessment,
        investigation: result.investigation,
        recommendations: result.recommendations,
        limitations: result.limitations,
        generatedAt: result.generatedAt ?? new Date().toISOString(),
      };
    } catch (error) {
      if (error instanceof ZodError) {
        throw new Error('AI provider returned a schema-invalid analysis');
      }
      throw error;
    }
  }
}

function stripMarkdownFence(raw: string): string {
  const trimmed = raw.trim();
  const fenced = trimmed.match(/^```(?:json)?\s*([\s\S]*?)\s*```$/i);
  return fenced ? fenced[1].trim() : trimmed;
}
