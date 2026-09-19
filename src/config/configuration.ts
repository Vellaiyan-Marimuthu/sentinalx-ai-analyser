export default () => ({
  port: parseInt(process.env.PORT ?? '3005', 10),
  aiProvider: process.env.AI_PROVIDER ?? 'openai',
  openai: {
    apiKey: process.env.OPENAI_API_KEY || process.env.OMNI_API_KEY || '',
    baseUrl: process.env.OPENAI_BASE_URL || process.env.OMNI_BASE_URL || 'https://api.openai.com/v1',
    model: process.env.OPENAI_MODEL || process.env.OMNI_MODEL || 'gpt-4o',
    timeoutMs: parseInt(
      process.env.OPENAI_TIMEOUT_MS || process.env.OMNI_TIMEOUT_MS || '30000',
      10,
    ),
    maxRetries: parseInt(
      process.env.OPENAI_MAX_RETRIES || process.env.OMNI_MAX_RETRIES || '2',
      10,
    ),
  },
  auth: {
    internalServiceToken: process.env.INTERNAL_SERVICE_TOKEN ?? '',
  },
  analysisVersion: '1.0',
});
