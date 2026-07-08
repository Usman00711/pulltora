export type IssueIntelligenceInput = {
  state: string;
  labels: string[];
  createdAtGithub: Date;
  updatedAtGithub: Date;
};

export type IssueIntelligenceResult = {
  isStale: boolean;
  isCritical: boolean;
  reasons: string[];
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;
const CRITICAL_LABELS = ['bug', 'critical', 'urgent', 'security', 'production', 'hotfix', 'incident'];

function getAgeDays(date: Date, now: Date): number {
  return Math.floor((now.getTime() - date.getTime()) / MS_PER_DAY);
}

export function analyzeIssue(
  input: IssueIntelligenceInput,
  now = new Date()
): IssueIntelligenceResult {
  const reasons: string[] = [];
  const isOpen = input.state.toLowerCase() === 'open';
  const ageDays = getAgeDays(input.createdAtGithub, now);
  const inactiveDays = getAgeDays(input.updatedAtGithub, now);
  const normalizedLabels = input.labels.map((label) => label.toLowerCase());

  const isStale = isOpen && (ageDays > 14 || inactiveDays > 7);
  const isCritical = normalizedLabels.some((label) =>
    CRITICAL_LABELS.some((criticalLabel) => label.includes(criticalLabel))
  );

  if (isStale && ageDays > 14) {
    reasons.push('Issue has been open for more than 14 days');
  }

  if (isStale && inactiveDays > 7) {
    reasons.push('Issue has not been updated for more than 7 days');
  }

  if (isCritical) {
    reasons.push('Issue has critical delivery labels');
  }

  return {
    isStale,
    isCritical,
    reasons
  };
}

