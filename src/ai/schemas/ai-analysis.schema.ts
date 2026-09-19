import { z } from 'zod';

const recommendationSchema = z.object({
  type: z.string().min(1),
  target: z.string().min(1),
  suggestion: z.string().min(1),
});

const suggestedPolicySchema = z
  .object({
    type: z.string().min(1),
    api: z.string().optional(),
    target: z.string().optional(),
    parameters: z.record(z.string(), z.unknown()).optional(),
    configuration: z.record(z.string(), z.unknown()).optional(),
    reason: z.string().optional(),
  })
  .nullable();

export const aiAnalysisSchema = z.object({
  summary: z.string().min(1),
  whatHappened: z.array(z.string().min(1)).min(1),
  whyItMatters: z.array(z.string().min(1)).min(1),
  potentialImpact: z.array(z.string().min(1)).min(1),
  investigationSteps: z.array(z.string().min(1)).min(1),
  recommendations: z.array(recommendationSchema),
  suggestedPolicy: suggestedPolicySchema,
  limitations: z.array(z.string()),
});

export type ValidatedAiAnalysis = z.infer<typeof aiAnalysisSchema>;

const EXECUTION_CLAIM =
  /\b(i (have|just) (blocked|deployed|executed|enforced)|automatically (blocked|deployed)|waf rule (was|has been) (deployed|applied))\b/i;

export function validateAiAnalysis(payload: unknown): ValidatedAiAnalysis {
  const parsed = aiAnalysisSchema.parse(payload);
  const blob = JSON.stringify(parsed);

  if (/"executed"\s*:\s*true/i.test(blob) || /"deployed"\s*:\s*true/i.test(blob)) {
    throw new Error('AI response attempted to mark a recommendation as executed');
  }

  if (EXECUTION_CLAIM.test(blob)) {
    throw new Error('AI response claimed to execute a security action');
  }

  return parsed;
}
