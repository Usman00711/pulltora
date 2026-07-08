import {
  AnalysisSummary,
  CreateRepositoryPayload,
  DashboardIntelligence,
  HotspotFile,
  PaginatedResult,
  PullRequestSnapshot,
  IssueSnapshot,
  ContributorSnapshot,
  Repository,
  RepositoryHealth,
  RepositoryListResponse,
  ReviewBottlenecks,
  RiskSummary,
  SyncSummary,
  UpdateRepositoryPayload,
  WorkloadSummary
} from '@devpulse/shared';
import { authService } from './auth-service';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api/v1';

interface RequestOptions extends RequestInit {
  authRequired?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { authRequired = true, ...init } = options;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(init.headers && typeof init.headers === 'object' ? (init.headers as Record<string, string>) : {})
  };

  if (authRequired) {
    const token = authService.getAccessToken();

    if (!token) {
      throw new Error('No auth token found');
    }

    headers.Authorization = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers,
    ...init
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    const message =
      (payload as { message?: string })?.message ??
      `Request failed: ${response.status} ${response.statusText}`;
    throw new Error(message);
  }

  return payload as T;
}

export interface RepositoryListParams {
  page?: number;
  pageSize?: number;
}

function buildQuery(params: RepositoryListParams = {}): string {
  const query = new URLSearchParams();

  if (params.page) {
    query.set('page', String(params.page));
  }

  if (params.pageSize) {
    query.set('pageSize', String(params.pageSize));
  }

  return query.toString() ? `?${query.toString()}` : '';
}

export const repositoryService = {
  async list(params: RepositoryListParams = {}): Promise<RepositoryListResponse> {
    return request(`/repositories${buildQuery(params)}`);
  },

  async getById(id: string): Promise<Repository> {
    return request(`/repositories/${id}`);
  },

  async create(payload: CreateRepositoryPayload): Promise<Repository> {
    return request('/repositories', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async update(id: string, payload: UpdateRepositoryPayload): Promise<Repository> {
    return request(`/repositories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(payload)
    });
  },

  async syncRepository(id: string): Promise<SyncSummary> {
    return request(`/repositories/${id}/sync`, {
      method: 'POST'
    });
  },

  async analyzeRepository(id: string): Promise<AnalysisSummary> {
    return request(`/repositories/${id}/analyze`, {
      method: 'POST'
    });
  },

  async getRisks(id: string): Promise<RiskSummary> {
    return request(`/repositories/${id}/risks`);
  },

  async getRepositoryHealth(id: string): Promise<RepositoryHealth> {
    return request(`/repositories/${id}/health`);
  },

  async getDashboardIntelligence(): Promise<DashboardIntelligence> {
    return request('/dashboard/intelligence');
  },

  async listPullRequests(
    id: string,
    params: RepositoryListParams = {}
  ): Promise<PaginatedResult<PullRequestSnapshot>> {
    return request(`/repositories/${id}/pull-requests${buildQuery(params)}`);
  },

  async listIssues(
    id: string,
    params: RepositoryListParams = {}
  ): Promise<PaginatedResult<IssueSnapshot>> {
    return request(`/repositories/${id}/issues${buildQuery(params)}`);
  },

  async listContributors(
    id: string,
    params: RepositoryListParams = {}
  ): Promise<PaginatedResult<ContributorSnapshot>> {
    return request(`/repositories/${id}/contributors${buildQuery(params)}`);
  },

  async listHotspots(
    id: string,
    params: RepositoryListParams = {}
  ): Promise<PaginatedResult<HotspotFile>> {
    return request(`/repositories/${id}/hotspots${buildQuery(params)}`);
  },

  async getReviewBottlenecks(id: string): Promise<ReviewBottlenecks> {
    return request(`/repositories/${id}/review-bottlenecks`);
  },

  async getWorkloadSummary(id: string): Promise<WorkloadSummary> {
    return request(`/repositories/${id}/workload-summary`);
  },

  async delete(id: string): Promise<void> {
    await request(`/repositories/${id}`, {
      method: 'DELETE',
      authRequired: true
    });
  }
};
