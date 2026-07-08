export type HealthLevel = 'EXCELLENT' | 'STABLE' | 'WATCH' | 'AT_RISK';

export type RepositoryHealthInput = {
  highRiskPrs: number;
  criticalPrs: number;
  stalePrs: number;
  staleIssues: number;
  criticalIssues: number;
  reviewBottlenecks: number;
  riskyHotspots: number;
};

export type RepositoryHealthResult = {
  score: number;
  level: HealthLevel;
  reasons: string[];
};

function getHealthLevel(score: number): HealthLevel {
  if (score >= 85) return 'EXCELLENT';
  if (score >= 70) return 'STABLE';
  if (score >= 50) return 'WATCH';
  return 'AT_RISK';
}

export function calculateRepositoryHealth(input: RepositoryHealthInput): RepositoryHealthResult {
  const deductions = [
    input.highRiskPrs * 8,
    input.criticalPrs * 12,
    input.stalePrs * 6,
    input.criticalIssues * 8,
    input.staleIssues * 6,
    input.reviewBottlenecks * 5,
    input.riskyHotspots * 4
  ];

  const score = Math.max(0, Math.min(100, 100 - deductions.reduce((sum, value) => sum + value, 0)));
  const reasons: string[] = [];

  if (input.highRiskPrs > 0) reasons.push(`${input.highRiskPrs} high-risk PRs`);
  if (input.criticalPrs > 0) reasons.push(`${input.criticalPrs} critical PRs`);
  if (input.stalePrs > 0) reasons.push(`${input.stalePrs} stale PRs`);
  if (input.criticalIssues > 0) reasons.push(`${input.criticalIssues} critical issues`);
  if (input.staleIssues > 0) reasons.push(`${input.staleIssues} stale issues`);
  if (input.reviewBottlenecks > 0) reasons.push(`${input.reviewBottlenecks} review bottlenecks`);
  if (input.riskyHotspots > 0) reasons.push(`${input.riskyHotspots} risky hotspot files`);

  return {
    score,
    level: getHealthLevel(score),
    reasons: reasons.length ? reasons : ['No major delivery risks detected']
  };
}

