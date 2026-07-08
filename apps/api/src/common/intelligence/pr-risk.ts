export type PullRequestRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export type PullRequestRiskInput = {
  createdAtGithub: Date;
  filesChanged: number;
  additions: number;
  deletions: number;
  changedFileNames: string[];
  hasDescription: boolean;
  reviewCount: number;
  isDraft: boolean;
};

export type PullRequestRiskResult = {
  score: number;
  level: PullRequestRiskLevel;
  reasons: string[];
};

const MS_PER_DAY = 1000 * 60 * 60 * 24;

const CRITICAL_MODULE_PATTERNS = [
  'auth',
  'payment',
  'billing',
  'security',
  'middleware',
  'schema.prisma',
  'migration',
  '.env',
  'config',
  'docker',
  'package.json',
  'package-lock.json',
  'pnpm-lock.yaml',
  'yarn.lock',
  'bun.lockb'
];

function getAgeDays(date: Date, now: Date): number {
  return Math.floor((now.getTime() - date.getTime()) / MS_PER_DAY);
}

function getRiskLevel(score: number): PullRequestRiskLevel {
  if (score >= 75) {
    return 'CRITICAL';
  }

  if (score >= 50) {
    return 'HIGH';
  }

  if (score >= 25) {
    return 'MEDIUM';
  }

  return 'LOW';
}

function includesAnyPath(filePath: string, patterns: string[]): boolean {
  const normalized = filePath.toLowerCase();
  return patterns.some((pattern) => normalized.includes(pattern));
}

export function calculatePullRequestRisk(
  input: PullRequestRiskInput,
  now = new Date()
): PullRequestRiskResult {
  let score = 0;
  const reasons: string[] = [];
  const ageDays = getAgeDays(input.createdAtGithub, now);
  const totalChanges = input.additions + input.deletions;

  if (ageDays > 3) {
    score += 10;
    reasons.push('PR is older than 3 days');
  }

  if (ageDays > 7) {
    score += 20;
    reasons.push('PR is older than 7 days');
  }

  if (input.filesChanged > 10) {
    score += 10;
    reasons.push('PR changes more than 10 files');
  }

  if (input.filesChanged > 25) {
    score += 20;
    reasons.push('PR changes more than 25 files');
  }

  if (totalChanges > 500) {
    score += 10;
    reasons.push('PR changes more than 500 lines');
  }

  if (totalChanges > 1500) {
    score += 20;
    reasons.push('PR changes more than 1500 lines');
  }

  if (input.reviewCount === 0) {
    score += 15;
    reasons.push('PR has no reviews');
  }

  if (!input.hasDescription) {
    score += 10;
    reasons.push('PR has no description');
  }

  if (input.isDraft && ageDays > 3) {
    score += 10;
    reasons.push('Draft PR is older than 3 days');
  }

  if (input.changedFileNames.some((file) => includesAnyPath(file, CRITICAL_MODULE_PATTERNS))) {
    score += 15;
    reasons.push('PR touches a critical module');
  }

  if (
    input.changedFileNames.some((file) =>
      includesAnyPath(file, ['schema.prisma', 'migration', 'migrations', 'database', 'db/schema'])
    )
  ) {
    score += 20;
    reasons.push('PR touches database, schema, or migration files');
  }

  if (
    input.changedFileNames.some((file) =>
      includesAnyPath(file, ['auth', 'payment', 'billing', 'security'])
    )
  ) {
    score += 20;
    reasons.push('PR touches auth, payment, billing, or security files');
  }

  const cappedScore = Math.min(score, 100);

  return {
    score: cappedScore,
    level: getRiskLevel(cappedScore),
    reasons
  };
}

