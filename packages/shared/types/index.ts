export type TimeRange = {
  from: string;
  to: string;
};

export type PaginatedResult<T> = {
  items: T[];
  page: number;
  pageSize: number;
  total: number;
};

export enum UserRole {
  Owner = 'owner',
  Lead = 'lead',
  Viewer = 'viewer'
}

export enum RiskSeverity {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical'
}

export type RiskDimension =
  | 'stale-pr'
  | 'review-bottleneck'
  | 'stale-issues'
  | 'workload-imbalance'
  | 'release-readiness'
  | 'technical-debt';

export type RiskEvent = {
  id: string;
  dimension: RiskDimension;
  severity: RiskSeverity;
  title: string;
  description: string;
  detectedAt: string;
};

export type RepositorySummary = {
  repositoryId: string;
  repositoryName: string;
  openPrs: number;
  stalePrs: number;
  openIssues: number;
  criticalIssues: number;
};

export type LoginDto = {
  email: string;
  password: string;
};

export type AuthPayload = {
  userId: string;
  email: string;
  role: UserRole;
};

export type Repository = {
  id: string;
  owner: string;
  name: string;
  fullName: string;
  url: string;
  description?: string;
  language?: string;
  stars: number;
  forks: number;
  defaultBranch?: string;
  lastSyncedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type SyncSummary = {
  repositoryId: string;
  syncedAt: string;
  pullRequestsSynced: number;
  issuesSynced: number;
  contributorsSynced: number;
  message: string;
};

export type AnalysisSummary = {
  repositoryId: string;
  analyzedAt: string;
  pullRequestsAnalyzed: number;
  highRiskPrs: number;
  criticalPrs: number;
  staleIssues: number;
  criticalIssues: number;
  contributorsAnalyzed: number;
  hotspotFiles: number;
  message: string;
};

export type PullRequestRiskLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
export type ContributorWorkloadLevel = 'BALANCED' | 'BUSY' | 'OVERLOADED' | 'AT_RISK';

export type PullRequestSnapshot = {
  id: string;
  repository: string;
  githubId: number;
  number: number;
  title: string;
  author: string;
  state: string;
  url: string;
  createdAtGithub: string;
  updatedAtGithub: string;
  closedAtGithub?: string;
  mergedAtGithub?: string;
  filesChanged: number;
  additions: number;
  deletions: number;
  changedFileNames: string[];
  hasDescription: boolean;
  reviewCount: number;
  isDraft: boolean;
  riskScore: number;
  riskLevel: PullRequestRiskLevel;
  riskReasons: string[];
  syncedAt: string;
};

export type IssueSnapshot = {
  id: string;
  repository: string;
  githubId: number;
  number: number;
  title: string;
  author: string;
  assignee?: string;
  state: string;
  url: string;
  labels: string[];
  createdAtGithub: string;
  updatedAtGithub: string;
  closedAtGithub?: string;
  isStale: boolean;
  isCritical: boolean;
  syncedAt: string;
};

export type ContributorSnapshot = {
  id: string;
  repository: string;
  username: string;
  avatarUrl?: string;
  profileUrl?: string;
  commits: number;
  openPrs: number;
  assignedIssues: number;
  pendingReviews: number;
  staleItems: number;
  workloadScore: number;
  workloadLevel: ContributorWorkloadLevel;
  syncedAt: string;
};

export type HotspotFile = {
  id: string;
  repository: string;
  filePath: string;
  module: string;
  changeCount: number;
  riskScore: number;
  relatedPrNumbers: number[];
  lastTouchedAt: string;
  analyzedAt: string;
};

export type RiskSummary = {
  highRiskPrs: number;
  criticalPrs: number;
  staleIssues: number;
  criticalIssues: number;
  hotspotFiles: number;
  busyContributors: number;
  overloadedContributors: number;
  atRiskContributors: number;
};

export type ReviewBottleneckItem = {
  id: string;
  number: number;
  title: string;
  author: string;
  url: string;
  ageDays: number;
  filesChanged: number;
  riskScore: number;
  riskLevel: PullRequestRiskLevel;
};

export type ReviewBottlenecks = {
  totalUnreviewedPrs: number;
  staleUnreviewedPrs: number;
  oldestUnreviewedPr?: ReviewBottleneckItem;
  averageAgeDays: number;
  items: ReviewBottleneckItem[];
};

export type WorkloadSummaryTotals = {
  balanced: number;
  busy: number;
  overloaded: number;
  atRisk: number;
};

export type WorkloadSummaryItem = {
  id: string;
  username: string;
  commits: number;
  openPrs: number;
  assignedIssues: number;
  pendingReviews: number;
  staleItems: number;
  workloadScore: number;
  workloadLevel: ContributorWorkloadLevel;
};

export type WorkloadSummary = {
  totals: WorkloadSummaryTotals;
  items: WorkloadSummaryItem[];
};

export type HealthLevel = 'EXCELLENT' | 'STABLE' | 'WATCH' | 'AT_RISK';

export type RepositoryHealth = {
  repositoryId: string;
  score: number;
  level: HealthLevel;
  reasons: string[];
  highRiskPrs: number;
  criticalPrs: number;
  stalePrs: number;
  staleIssues: number;
  criticalIssues: number;
  reviewBottlenecks: number;
  hotspotFiles: number;
  lastSyncedAt?: string | null;
  lastAnalyzedAt?: string | null;
};

export type DistributionPoint = {
  name: string;
  value: number;
};

export type DashboardTotals = {
  repositories: number;
  averageHealth: number;
  highRiskPrs: number;
  criticalPrs: number;
  staleIssues: number;
  criticalIssues: number;
  reviewBottlenecks: number;
  hotspotFiles: number;
};

export type DashboardRepositoryHealth = {
  repositoryId: string;
  fullName: string;
  score: number;
  level: HealthLevel;
  highRiskPrs: number;
  criticalIssues: number;
  reviewBottlenecks: number;
  hotspotFiles: number;
  lastSyncedAt?: string | null;
};

export type DashboardIntelligence = {
  totals: DashboardTotals;
  repositories: DashboardRepositoryHealth[];
  prRiskDistribution: DistributionPoint[];
  issueDistribution: DistributionPoint[];
  workloadDistribution: DistributionPoint[];
  hotspotModules: DistributionPoint[];
  topRisks: string[];
};

export type CreateRepositoryPayload = {
  owner: string;
  name: string;
  description?: string;
  language?: string;
  defaultBranch?: string;
};

export type UpdateRepositoryPayload = Partial<CreateRepositoryPayload>;

export type RepositoryListResponse = PaginatedResult<Repository>;

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};
