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

export type TokenPair = {
  accessToken: string;
  refreshToken: string;
};
