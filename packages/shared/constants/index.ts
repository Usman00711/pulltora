export const API_V1_PREFIX = '/api/v1';

export const DEFAULT_STALE_PR_DAYS = 5;

export const DEFAULT_STALE_ISSUE_DAYS = 7;

export const DEFAULT_WORKLOAD_IMBALANCE_WINDOW_DAYS = 30;

export const RISK_DIMENSIONS = [
  'stale-pr',
  'review-bottleneck',
  'stale-issues',
  'workload-imbalance',
  'release-readiness',
  'technical-debt'
] as const;
