export type WorkloadLevel = 'BALANCED' | 'BUSY' | 'OVERLOADED' | 'AT_RISK';

export type WorkloadScoreInput = {
  openPrs: number;
  assignedIssues: number;
  pendingReviews: number;
  staleItems: number;
};

export type WorkloadScoreResult = {
  score: number;
  level: WorkloadLevel;
  reasons: string[];
};

function getWorkloadLevel(score: number): WorkloadLevel {
  if (score >= 75) {
    return 'AT_RISK';
  }

  if (score >= 50) {
    return 'OVERLOADED';
  }

  if (score >= 25) {
    return 'BUSY';
  }

  return 'BALANCED';
}

export function calculateWorkloadScore(input: WorkloadScoreInput): WorkloadScoreResult {
  const score =
    input.openPrs * 10 +
    input.assignedIssues * 5 +
    input.pendingReviews * 10 +
    input.staleItems * 10;

  const reasons: string[] = [];

  if (input.openPrs > 0) {
    reasons.push(`${input.openPrs} open PR${input.openPrs === 1 ? '' : 's'}`);
  }

  if (input.assignedIssues > 0) {
    reasons.push(`${input.assignedIssues} assigned issue${input.assignedIssues === 1 ? '' : 's'}`);
  }

  if (input.pendingReviews > 0) {
    reasons.push(`${input.pendingReviews} pending review${input.pendingReviews === 1 ? '' : 's'}`);
  }

  if (input.staleItems > 0) {
    reasons.push(`${input.staleItems} stale item${input.staleItems === 1 ? '' : 's'}`);
  }

  return {
    score,
    level: getWorkloadLevel(score),
    reasons
  };
}

