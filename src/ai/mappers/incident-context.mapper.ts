import { AnalyzeIncidentDto } from '../dto/analyze-incident.dto';

export interface MappedIncidentContext {
  promptText: string;
}

function formatPercent(confidence: number): string {
  return `${Math.round(confidence * 100)}%`;
}

function formatTimeRange(start: string, end: string): string {
  const startDate = new Date(start);
  const endDate = new Date(end);

  if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    return `${start} - ${end}`;
  }

  const sameDay = startDate.toISOString().slice(0, 10) === endDate.toISOString().slice(0, 10);
  const startLabel = sameDay
    ? startDate.toISOString().slice(11, 16)
    : startDate.toISOString().replace('.000Z', 'Z');
  const endLabel = sameDay
    ? `${endDate.toISOString().slice(11, 16)} UTC`
    : endDate.toISOString().replace('.000Z', 'Z');

  return `${startLabel} - ${endLabel}`;
}

function listOrNone(values: string[]): string {
  return values.length ? values.join(', ') : 'none supplied';
}

export function mapIncidentToContext(incident: AnalyzeIncidentDto): MappedIncidentContext {
  const { cluster, apiContext, wafEvidence, agentEvidence } = incident;

  const promptText = [
    'SECURITY INCIDENT',
    '',
    'Attack Type:',
    cluster.type,
    '',
    'Severity:',
    cluster.severity,
    '',
    'Confidence:',
    formatPercent(cluster.confidence),
    '',
    'Target:',
    `${apiContext.method} ${cluster.targetApi}`,
    `Operation: ${apiContext.operationType}`,
    `Sensitivity: ${apiContext.sensitivity}`,
    `Exposure: ${apiContext.exposure}`,
    incident.applicationId ? `Application: ${incident.applicationId}` : '',
    '',
    'Time Range:',
    formatTimeRange(cluster.startTime, cluster.endTime),
    '',
    'Statistics:',
    `${cluster.requestCount} requests`,
    `${cluster.ipCount} unique IPs`,
    `${cluster.userCount} users`,
    `${wafEvidence.blockedCount} blocked`,
    `${wafEvidence.nonBlockedCount} non-blocked`,
    '',
    'Security Signals:',
    listOrNone(cluster.signals),
    '',
    'WAF Evidence:',
    `${wafEvidence.eventCount} WAF events`,
    `${wafEvidence.blockedCount} blocked`,
    `${wafEvidence.nonBlockedCount} not blocked`,
    `Rule IDs: ${listOrNone(wafEvidence.ruleIds)}`,
    `Labels: ${listOrNone(wafEvidence.labels)}`,
    '',
    'Agent Evidence:',
    `${agentEvidence.eventCount} agent events`,
    `Violations: ${listOrNone(agentEvidence.violations)}`,
    '',
    'Correlation Evidence:',
    ...(incident.correlationEvidence.length
      ? incident.correlationEvidence.map((item) => `- ${item}`)
      : ['- none supplied']),
    '',
    'Deterministic Attack Story:',
    incident.deterministicStory,
  ]
    .filter((line, index, lines) => !(line === '' && lines[index - 1] === ''))
    .join('\n')
    .trim();

  return { promptText };
}
