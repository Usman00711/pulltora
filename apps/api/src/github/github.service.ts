import { HttpException, HttpStatus, Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

type GithubRepository = {
  id?: number;
  name?: string;
  full_name?: string;
  description?: string | null;
  language?: string | null;
  stargazers_count?: number;
  forks_count?: number;
  default_branch?: string;
};

type GithubPullRequest = {
  id?: number;
  number?: number;
  title?: string;
  state?: string;
  draft?: boolean;
  body?: string | null;
  html_url?: string;
  user?: { login?: string } | null;
  created_at?: string;
  updated_at?: string;
  closed_at?: string | null;
  merged_at?: string | null;
};

type GithubPullRequestFile = {
  filename?: string;
  additions?: number;
  deletions?: number;
};

type GithubPullRequestReview = {
  id?: number;
};

type GithubIssue = {
  id?: number;
  number?: number;
  title?: string;
  state?: string;
  html_url?: string;
  user?: { login?: string } | null;
  assignee?: { login?: string } | null;
  labels?: Array<{ name?: string } | string>;
  created_at?: string;
  updated_at?: string;
  closed_at?: string | null;
  pull_request?: Record<string, unknown>;
};

type GithubContributor = {
  id?: number;
  login?: string;
  avatar_url?: string;
  html_url?: string;
  contributions?: number;
};


@Injectable()
export class GithubService {
  private readonly githubApiBase = 'https://api.github.com';

  constructor(private readonly configService: ConfigService) {}

  private get headers(): HeadersInit {
    const token = this.configService.get<string>('GITHUB_TOKEN')?.trim();

    const headers: Record<string, string> = {
      Accept: 'application/vnd.github+json',
      'User-Agent': 'Pulltora-Sync/1.0'
    };

    if (token) {
      headers.Authorization = `token ${token}`;
    }

    return headers;
  }

  private async githubRequest<T>(path: string): Promise<T> {
    const url = `${this.githubApiBase}${path}`;
    let response: Response;

    try {
      response = await fetch(url, {
        headers: this.headers
      });
    } catch {
      throw new HttpException('Unable to reach GitHub API', HttpStatus.BAD_GATEWAY);
    }

    if (!response.ok) {
      const payload = (await response
        .json()
        .catch(() => ({} as Record<string, unknown>))) as Record<string, unknown>;
      const message =
        (typeof payload.message === 'string' && payload.message) ||
        `GitHub request failed (${response.status})`;

      const remaining =
        response.headers.get('x-ratelimit-remaining') ??
        response.headers.get('X-RateLimit-Remaining');

      if (
        response.status === 403 &&
        (remaining === '0' || message.toLowerCase().includes('rate limit'))
      ) {
        throw new HttpException(
          'GitHub rate limit exceeded. Please add GITHUB_TOKEN or try later.',
          HttpStatus.TOO_MANY_REQUESTS
        );
      }

      if (response.status === 401) {
        throw new HttpException(
          'Invalid or expired GitHub token. Update GITHUB_TOKEN and restart the API.',
          HttpStatus.UNAUTHORIZED
        );
      }

      if (response.status === 404) {
        throw new NotFoundException(message || 'GitHub repository not found');
      }

      throw new HttpException(message, HttpStatus.BAD_REQUEST);
    }

    return (await response.json()) as T;
  }

  async fetchRepository(owner: string, name: string): Promise<GithubRepository> {
    const response = await this.githubRequest<GithubRepository>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}`
    );

    return response;
  }

  async fetchPullRequests(owner: string, name: string): Promise<GithubPullRequest[]> {
    const response = await this.githubRequest<GithubPullRequest[]>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/pulls?state=all&per_page=30`
    );

    return response || [];
  }

  async fetchPullRequestFiles(owner: string, name: string, pullNumber: number): Promise<GithubPullRequestFile[]> {
    const response = await this.githubRequest<GithubPullRequestFile[]>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/pulls/${pullNumber}/files`
    );

    return response || [];
  }

  async fetchPullRequestReviews(owner: string, name: string, pullNumber: number): Promise<GithubPullRequestReview[]> {
    const response = await this.githubRequest<GithubPullRequestReview[]>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/pulls/${pullNumber}/reviews`
    );

    return response || [];
  }

  async fetchIssues(owner: string, name: string): Promise<GithubIssue[]> {
    const response = await this.githubRequest<GithubIssue[]>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/issues?state=all&per_page=30`
    );

    return response || [];
  }

  async fetchContributors(owner: string, name: string): Promise<GithubContributor[]> {
    const response = await this.githubRequest<GithubContributor[]>(
      `/repos/${encodeURIComponent(owner)}/${encodeURIComponent(name)}/contributors?per_page=30`
    );

    return response || [];
  }

  getNormalizedLabelName(label: { name?: string } | string): string {
    return typeof label === 'string'
      ? label.trim()
      : typeof label?.name === 'string'
        ? label.name.trim()
        : '';
  }

}
