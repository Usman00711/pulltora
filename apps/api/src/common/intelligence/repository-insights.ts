import {
  RepositoryInsightCategory,
  RepositoryInsightImpact,
  RepositoryInsightSource
} from '../../repositories/schemas/repository-insight.schema';

export type InsightPullRequest = {
  number: number;
  title: string;
  author: string;
  state: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  changedFileNames: string[];
  reviewCount: number;
  riskScore: number;
  riskLevel: string;
  riskReasons: string[];
};

export type InsightIssue = {
  number: number;
  title: string;
  state: string;
  labels: string[];
  isStale: boolean;
  isCritical: boolean;
};

export type InsightContributor = {
  username: string;
  openPrs: number;
  assignedIssues: number;
  pendingReviews: number;
  staleItems: number;
  workloadScore: number;
  workloadLevel: string;
};

export type InsightHotspot = {
  filePath: string;
  module: string;
  changeCount: number;
  riskScore: number;
  relatedPrNumbers: number[];
};

export type RepositoryInsightDraft = {
  category: RepositoryInsightCategory;
  title: string;
  description: string;
  rationale: string;
  impact: RepositoryInsightImpact;
  confidence: number;
  source: RepositoryInsightSource;
  relatedFiles: string[];
  relatedPrNumbers: number[];
  relatedIssueNumbers: number[];
};

export type RepositoryInsightContext = {
  repositoryFullName: string;
  healthScore?: number;
  healthLevel?: string;
  pullRequests: InsightPullRequest[];
  issues: InsightIssue[];
  contributors: InsightContributor[];
  hotspots: InsightHotspot[];
};

const criticalPathPatterns = [
  'auth',
  'payment',
  'billing',
  'security',
  'middleware',
  'schema',
  'migration',
  '.env',
  'config',
  'docker',
  'package.json',
  'lock'
];

function uniqueNumbers(values: number[]): number[] {
  return Array.from(new Set(values)).filter((value) => Number.isFinite(value));
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.map((value) => value.trim()).filter(Boolean)));
}

function hasCriticalPath(filePath: string): boolean {
  const normalized = filePath.toLowerCase();
  return criticalPathPatterns.some((pattern) => normalized.includes(pattern));
}

function makeInsight(
  insight: Omit<RepositoryInsightDraft, 'source'>
): RepositoryInsightDraft {
  return {
    ...insight,
    source: RepositoryInsightSource.RULES
  };
}

export function buildRepositoryInsightContextSummary(context: RepositoryInsightContext): string {
  const highRiskPrs = context.pullRequests.filter((pr) => pr.riskLevel === 'HIGH');
  const criticalPrs = context.pullRequests.filter((pr) => pr.riskLevel === 'CRITICAL');
  const staleIssues = context.issues.filter((issue) => issue.isStale);
  const criticalIssues = context.issues.filter((issue) => issue.isCritical);
  const riskyHotspots = context.hotspots.filter((hotspot) => hotspot.riskScore >= 50);
  const overloadedContributors = context.contributors.filter((contributor) =>
    ['OVERLOADED', 'AT_RISK'].includes(contributor.workloadLevel)
  );

  return [
    `Repository: ${context.repositoryFullName}`,
    `Health: ${context.healthScore ?? 'unknown'} (${context.healthLevel ?? 'unknown'})`,
    `Pull requests: ${context.pullRequests.length}, high-risk: ${highRiskPrs.length}, critical: ${criticalPrs.length}`,
    `Issues: ${context.issues.length}, stale: ${staleIssues.length}, critical: ${criticalIssues.length}`,
    `Contributors: ${context.contributors.length}, overloaded or at risk: ${overloadedContributors.length}`,
    `Hotspots: ${context.hotspots.length}, risky hotspots: ${riskyHotspots.length}`,
    `Top hotspot files: ${context.hotspots.slice(0, 8).map((hotspot) => `${hotspot.filePath} (${hotspot.module}, risk ${hotspot.riskScore})`).join('; ') || 'none'}`,
    `Top risky PRs: ${context.pullRequests
      .filter((pr) => ['HIGH', 'CRITICAL'].includes(pr.riskLevel))
      .slice(0, 8)
      .map((pr) => `#${pr.number} ${pr.title} (${pr.riskLevel}, ${pr.riskScore})`)
      .join('; ') || 'none'}`
  ].join('\n');
}

export function generateRuleBasedRepositoryInsights(
  context: RepositoryInsightContext
): RepositoryInsightDraft[] {
  const insights: RepositoryInsightDraft[] = [];
  const highRiskPrs = context.pullRequests.filter((pr) => pr.riskLevel === 'HIGH');
  const criticalPrs = context.pullRequests.filter((pr) => pr.riskLevel === 'CRITICAL');
  const riskyPrs = [...criticalPrs, ...highRiskPrs];
  const unreviewedPrs = context.pullRequests.filter(
    (pr) => pr.state.toLowerCase() === 'open' && pr.reviewCount === 0
  );
  const staleIssues = context.issues.filter((issue) => issue.isStale);
  const criticalIssues = context.issues.filter((issue) => issue.isCritical);
  const overloadedContributors = context.contributors.filter((contributor) =>
    ['OVERLOADED', 'AT_RISK'].includes(contributor.workloadLevel)
  );
  const riskyHotspots = context.hotspots.filter((hotspot) => hotspot.riskScore >= 50);
  const criticalFilePrs = context.pullRequests.filter((pr) =>
    pr.changedFileNames.some((filePath) => hasCriticalPath(filePath))
  );
  const hasSparseActivity =
    context.pullRequests.length === 0 &&
    context.issues.length === 0 &&
    context.hotspots.length === 0;

  if (hasSparseActivity) {
    insights.push(
      makeInsight({
        category: RepositoryInsightCategory.DX,
        title: 'Create more observable delivery signals',
        description:
          'Pulltora did not find pull requests, standalone issues, or hotspot files in the synced snapshot. Add PR-based workflow, issue labels, and review activity so future analysis can produce deeper engineering intelligence.',
        rationale:
          'The current GitHub snapshot is very small, so the strongest improvement is to create richer delivery data before relying on risk trends.',
        impact: RepositoryInsightImpact.MEDIUM,
        confidence: 92,
        relatedFiles: [],
        relatedPrNumbers: [],
        relatedIssueNumbers: []
      })
    );
  }

  if (context.pullRequests.length === 0 && context.contributors.length > 0) {
    insights.push(
      makeInsight({
        category: RepositoryInsightCategory.REVIEW_PROCESS,
        title: 'Use pull requests to make delivery risk visible',
        description:
          'Use pull requests for even small changes so review bottlenecks, risky file changes, and delivery trends become measurable.',
        rationale: `${context.contributors.length} contributor(s) were detected, but GitHub returned no pull requests for this repository.`,
        impact: RepositoryInsightImpact.MEDIUM,
        confidence: 88,
        relatedFiles: [],
        relatedPrNumbers: [],
        relatedIssueNumbers: []
      })
    );
  }

  if (context.issues.length === 0) {
    insights.push(
      makeInsight({
        category: RepositoryInsightCategory.RELEASE_RISK,
        title: 'Track bugs and release risks with labeled issues',
        description:
          'Add issue labels such as bug, critical, security, hotfix, and production so Pulltora can detect stale or release-blocking work.',
        rationale:
          'No standalone issues were found in the synced GitHub issue data, so issue intelligence has limited signal.',
        impact: RepositoryInsightImpact.LOW,
        confidence: 80,
        relatedFiles: [],
        relatedPrNumbers: [],
        relatedIssueNumbers: []
      })
    );
  }

  if (riskyPrs.length > 0) {
    insights.push(
      makeInsight({
        category: RepositoryInsightCategory.REVIEW_PROCESS,
        title: 'Tighten review focus around high-risk pull requests',
        description:
          'Prioritize smaller review batches, explicit reviewer ownership, and a same-day review target for the highest-risk pull requests.',
        rationale: `${riskyPrs.length} pull request(s) are currently HIGH or CRITICAL risk, usually because of age, size, missing reviews, or sensitive file changes.`,
        impact: criticalPrs.length > 0 ? RepositoryInsightImpact.CRITICAL : RepositoryInsightImpact.HIGH,
        confidence: 90,
        relatedFiles: uniqueStrings(riskyPrs.flatMap((pr) => pr.changedFileNames)).slice(0, 12),
        relatedPrNumbers: uniqueNumbers(riskyPrs.map((pr) => pr.number)),
        relatedIssueNumbers: []
      })
    );
  }

  if (unreviewedPrs.length > 0) {
    insights.push(
      makeInsight({
        category: RepositoryInsightCategory.REVIEW_PROCESS,
        title: 'Reduce review bottlenecks before they become stale',
        description:
          'Create a lightweight review rotation or reviewer checklist so open PRs do not sit without feedback.',
        rationale: `${unreviewedPrs.length} open pull request(s) have zero reviews, which slows delivery and hides integration risk.`,
        impact: unreviewedPrs.length > 3 ? RepositoryInsightImpact.HIGH : RepositoryInsightImpact.MEDIUM,
        confidence: 86,
        relatedFiles: uniqueStrings(unreviewedPrs.flatMap((pr) => pr.changedFileNames)).slice(0, 10),
        relatedPrNumbers: uniqueNumbers(unreviewedPrs.map((pr) => pr.number)),
        relatedIssueNumbers: []
      })
    );
  }

  if (criticalFilePrs.length > 0) {
    insights.push(
      makeInsight({
        category: RepositoryInsightCategory.SECURITY,
        title: 'Add extra guardrails for sensitive code paths',
        description:
          'Require stronger review, targeted tests, and rollback notes for changes touching auth, config, database, package, or security-related files.',
        rationale: `${criticalFilePrs.length} pull request(s) touched sensitive paths that can create release or security regressions.`,
        impact: RepositoryInsightImpact.HIGH,
        confidence: 88,
        relatedFiles: uniqueStrings(
          criticalFilePrs.flatMap((pr) => pr.changedFileNames.filter((filePath) => hasCriticalPath(filePath)))
        ).slice(0, 12),
        relatedPrNumbers: uniqueNumbers(criticalFilePrs.map((pr) => pr.number)),
        relatedIssueNumbers: []
      })
    );
  }

  if (riskyHotspots.length > 0) {
    insights.push(
      makeInsight({
        category: RepositoryInsightCategory.MAINTAINABILITY,
        title: 'Stabilize hotspot modules with tests and ownership',
        description:
          'Turn the riskiest hotspot files into explicit ownership areas and add focused tests around their most changed behavior.',
        rationale: `${riskyHotspots.length} file(s) have elevated hotspot risk based on repeated changes and critical path patterns.`,
        impact: riskyHotspots.some((hotspot) => hotspot.riskScore >= 75)
          ? RepositoryInsightImpact.CRITICAL
          : RepositoryInsightImpact.HIGH,
        confidence: 84,
        relatedFiles: uniqueStrings(riskyHotspots.map((hotspot) => hotspot.filePath)).slice(0, 12),
        relatedPrNumbers: uniqueNumbers(riskyHotspots.flatMap((hotspot) => hotspot.relatedPrNumbers)),
        relatedIssueNumbers: []
      })
    );
  }

  if (criticalIssues.length > 0 || staleIssues.length > 0) {
    insights.push(
      makeInsight({
        category: RepositoryInsightCategory.RELEASE_RISK,
        title: 'Clear stale and critical issues before release planning',
        description:
          'Review critical and stale issues as part of release readiness, then mark each as fix-now, accept-risk, or defer.',
        rationale: `${criticalIssues.length} critical issue(s) and ${staleIssues.length} stale issue(s) are present in the synced issue data.`,
        impact: criticalIssues.length > 0 ? RepositoryInsightImpact.HIGH : RepositoryInsightImpact.MEDIUM,
        confidence: 82,
        relatedFiles: [],
        relatedPrNumbers: [],
        relatedIssueNumbers: uniqueNumbers([...criticalIssues, ...staleIssues].map((issue) => issue.number))
      })
    );
  }

  if (overloadedContributors.length > 0) {
    insights.push(
      makeInsight({
        category: RepositoryInsightCategory.WORKLOAD,
        title: 'Rebalance ownership across contributors',
        description:
          'Move reviews, issue ownership, or PR follow-up away from overloaded contributors to reduce delivery risk.',
        rationale: `${overloadedContributors.length} contributor(s) are marked OVERLOADED or AT_RISK based on PRs, issues, reviews, and stale items.`,
        impact: RepositoryInsightImpact.MEDIUM,
        confidence: 78,
        relatedFiles: [],
        relatedPrNumbers: [],
        relatedIssueNumbers: []
      })
    );
  }

  if (insights.length === 0) {
    insights.push(
      makeInsight({
        category: RepositoryInsightCategory.DX,
        title: 'Use Pulltora trends to preserve the current delivery rhythm',
        description:
          'Keep PRs small, maintain review responsiveness, and continue watching hotspots so delivery risk stays low.',
        rationale:
          'The current analyzed snapshot does not show major delivery risks, which is a good moment to reinforce team habits.',
        impact: RepositoryInsightImpact.LOW,
        confidence: 72,
        relatedFiles: [],
        relatedPrNumbers: [],
        relatedIssueNumbers: []
      })
    );
  }

  return insights.slice(0, 8);
}
