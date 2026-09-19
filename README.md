# SentinelX AI Analyzer Service

> The correlation engine decides what events belong together; AI explains what that incident means and recommends what an analyst should investigate or consider doing.

NestJS microservice that accepts an already-correlated **Attack Cluster**, builds a controlled prompt from supplied evidence, calls **OpenAI GPT-4o** (Omni 4.0), validates the structured response, and returns an advisory investigation analysis.

It does **not** detect attacks, correlate events, block traffic, or deploy policies.

## Quick start

```bash
cp .env.example .env
npm install
npm run start:dev
```

Health check:

```http
GET /api/v1/health
```

Analyze an incident:

```http
POST /api/v1/ai/analyze
Content-Type: application/json
Authorization: Bearer <INTERNAL_SERVICE_TOKEN>
```

A ready-to-send payload lives in `examples/attack-cluster.json`.

```bash
npm run demo
```

For a local demo without an OpenAI key, set:

```env
AI_PROVIDER=mock
```

For OpenAI GPT-4o (Omni 4.0):

```env
AI_PROVIDER=openai
OPENAI_API_KEY=sk-...
OPENAI_BASE_URL=https://api.openai.com/v1
OPENAI_MODEL=gpt-4o
```

## What the service returns

The analyzer wraps the model output:

- What happened
- Why it matters
- Potential impact
- Investigation steps
- Advisory recommendations
- Suggested policy
- Limitations

Recommendations are advisory only. This service never executes them.

## Error contract

| Condition | Status | Code |
| --- | --- | --- |
| Invalid Attack Cluster | 400 | `INVALID_ANALYSIS_REQUEST` |
| Missing/invalid service token | 401 | `UNAUTHORIZED` |
| Omni unavailable | 502 | `AI_PROVIDER_ERROR` |
| Malformed or schema-invalid AI JSON | 502 | `INVALID_AI_RESPONSE` |
| Omni timeout | 504 | `AI_ANALYSIS_TIMEOUT` |

## Security boundaries

- Passwords, Authorization headers, cookies, credentials, and raw request bodies are stripped and never sent to the model.
- Incident fields are wrapped as untrusted evidence and must not be treated as instructions.
- The official cluster confidence score is never overwritten.
- AI output is JSON-parsed, schema-validated, and rejected if it claims to have executed a control.
