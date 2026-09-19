export default () => ({
  port: parseInt(process.env.PORT ?? '3005', 10),
  ai: {
    provider: process.env.AI_PROVIDER ?? 'openai',
    model: process.env.AI_MODEL || process.env.OPENAI_MODEL || 'gpt-4o',
    temperature: Number(process.env.AI_TEMPERATURE ?? '0'),
    timeoutMs: parseInt(process.env.AI_TIMEOUT_MS ?? process.env.OPENAI_TIMEOUT_MS ?? '30000', 10),
    maxRetries: parseInt(process.env.AI_MAX_RETRIES ?? '1', 10),
    promptVersion: process.env.PROMPT_VERSION ?? '1.0',
    analysisVersion: '1.0',
    maxRepresentativeEvents: 20,
  },
  openai: {
    apiKey: process.env.OPENAI_API_KEY ?? '',
    baseUrl: process.env.OPENAI_BASE_URL ?? 'https://api.openai.com/v1',
  },
  auth: {
    applicationApiKey: process.env.APPLICATION_API_KEY ?? '',
    applicationId: process.env.APPLICATION_ID ?? 'app_sentinelx',
  },
  database: {
    path: process.env.DATABASE_PATH ?? 'data/sentinelx.sqlite',
  },
});
