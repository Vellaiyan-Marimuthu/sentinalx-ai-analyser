# SentinelX AI Analyzer Service

Deterministic systems decide what happened. AI helps humans understand what it means and what to investigate.

The AI Analyzer sits after the Correlation Engine and Attack Clusters. It does **not** detect attacks, change severity or confidence, or enforce policies.

## Quick start

```bash
cp .env.example .env
npm install
npm run start:dev
```

## API

Authenticate every request with:

```http
x-api-key: APPLICATION_API_KEY
```

Analyze a persisted cluster:

```http
POST /api/v1/analyze
```

Get the latest analysis:

```http
GET /api/v1/ai-analyzer/clusters/:clusterId
```

Regenerate from the stored snapshot or a new payload:

```http
POST /api/v1/ai-analyzer/clusters/:clusterId/reanalyze
```

A ready-to-send XSS campaign payload lives in `examples/attack-cluster.json`.

```bash
npm run demo
```

Swagger UI: [http://localhost:3005/api/docs](http://localhost:3005/api/docs)

Use **Authorize** and set `x-api-key` to `APPLICATION_API_KEY` before trying the analyzer endpoints.

## Environment

```env
AI_PROVIDER=openai
AI_MODEL=gpt-4o
AI_TEMPERATURE=0
OPENAI_API_KEY=sk-...
APPLICATION_API_KEY=sentinelx-app-key
APPLICATION_ID=app_sentinelx
```

## What the analyzer returns

Structured JSON only:

- Executive summary
- Attack explanation
- Risk explanation
- Investigation steps
- Recommendations
- Suggested policy (advisory, nullable)

If the model fails, the API returns a clean error. The Attack Cluster on SentinelX stays usable.

Analyses are persisted in SQLite (`data/sentinelx.sqlite`) and scoped by `applicationId`.
