export const XSS_ANALYZE_EXAMPLE = {
  cluster: {
    id: 'cluster-uuid',
    type: 'XSS_CAMPAIGN',
    severity: 'HIGH',
    confidence: 0.87,
    status: 'OPEN',
  },
  target: {
    apiId: 'api-uuid',
    method: 'GET',
    api: '/api/search',
    operationType: 'SEARCH',
    sensitivity: 'NORMAL',
    exposure: 'PUBLIC',
  },
  timeline: {
    startTime: '2026-09-19T01:02:00.000Z',
    endTime: '2026-09-19T01:06:00.000Z',
  },
  metrics: {
    requestCount: 16,
    ipCount: 5,
    userCount: 0,
    apiCount: 1,
  },
  sourceBreakdown: {
    agentEventCount: 0,
    wafEventCount: 16,
  },
  signals: ['WAF_XSS'],
  evidence: [
    '5 unique IP addresses',
    '16 XSS-related WAF events',
    '14 blocked by WAF',
    '2 not blocked by WAF',
  ],
  metadata: {
    blockedCount: 14,
    nonBlockedCount: 2,
    wafEventCount: 16,
  },
  attackStory: {
    headline: 'XSS campaign detected',
    summary:
      'SentinelX correlated 16 XSS-related requests from 5 IP addresses targeting /api/search within five minutes. AWS WAF blocked 14 requests while 2 were not blocked.',
    timelineSummary: 'Activity occurred between 01:02 and 01:06 UTC.',
    evidenceSummary: ['16 XSS-related WAF events', '5 unique source IPs'],
    recommendedInvestigation: ['Review the two non-blocked requests'],
  },
  representativeEvents: [
    {
      source: 'AWS_WAF',
      occurredAt: '2026-09-19T01:02:12.000Z',
      method: 'GET',
      path: '/api/search',
      action: 'BLOCKED',
      signal: 'WAF_RULE_MATCH',
      wafRuleId: 'AWS-AWSManagedRulesCommonRuleSet',
    },
  ],
};

export const SQLI_ANALYZE_EXAMPLE = {
  cluster: {
    id: 'cluster-sqli-001',
    type: 'SQL_INJECTION_CAMPAIGN',
    severity: 'HIGH',
    confidence: 0.91,
    status: 'OPEN',
  },
  target: {
    apiId: 'api-orders',
    method: 'GET',
    api: '/api/orders',
    operationType: 'READ',
    sensitivity: 'HIGH',
    exposure: 'AUTHENTICATED',
  },
  timeline: {
    startTime: '2026-09-19T03:10:00.000Z',
    endTime: '2026-09-19T03:14:00.000Z',
  },
  metrics: {
    requestCount: 22,
    ipCount: 4,
    userCount: 1,
    apiCount: 1,
  },
  sourceBreakdown: {
    agentEventCount: 6,
    wafEventCount: 16,
  },
  signals: ['WAF_SQLI', 'AGENT_INPUT_ANOMALY'],
  evidence: [
    '4 unique IP addresses',
    '16 SQLi-related WAF events',
    '6 SentinelX Agent input-anomaly events',
    '18 blocked by WAF',
    '4 not blocked by WAF',
  ],
  metadata: {
    blockedCount: 18,
    nonBlockedCount: 4,
    wafEventCount: 16,
  },
  attackStory: {
    headline: 'SQL injection campaign detected',
    summary:
      'SentinelX correlated 22 SQLi-related requests from 4 IP addresses targeting /api/orders within four minutes. AWS WAF blocked 18 requests while 4 were not blocked. The SentinelX Agent also recorded input anomalies on the same API.',
    timelineSummary: 'Activity occurred between 03:10 and 03:14 UTC.',
    evidenceSummary: ['16 SQLi-related WAF events', '6 agent input anomalies', '4 unique source IPs'],
    recommendedInvestigation: ['Review the four non-blocked requests and subsequent database errors'],
  },
  representativeEvents: [
    {
      source: 'AWS_WAF',
      occurredAt: '2026-09-19T03:10:08.000Z',
      method: 'GET',
      path: '/api/orders',
      action: 'BLOCKED',
      signal: 'WAF_RULE_MATCH',
      wafRuleId: 'AWS-AWSManagedRulesSQLiRuleSet',
    },
  ],
};
