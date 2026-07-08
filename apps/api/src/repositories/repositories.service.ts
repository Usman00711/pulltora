import {
  BadRequestException,
  Injectable,
  NotFoundException
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { GithubService } from '../github/github.service';
import { ActivityLog } from '../common/schemas/activity-log.schema';
import { calculateRepositoryHealth } from '../common/intelligence/health-score';
import { analyzeHotspots } from '../common/intelligence/hotspot-analysis';
import { analyzeIssue } from '../common/intelligence/issue-intelligence';
import { calculatePullRequestRisk } from '../common/intelligence/pr-risk';
import { calculateWorkloadScore } from '../common/intelligence/workload-score';
import {
  ContributorSnapshot,
  ContributorWorkloadLevel
} from './schemas/contributor-snapshot.schema';
import { HotspotFile } from './schemas/hotspot-file.schema';
import { IssueSnapshot } from './schemas/issue-snapshot.schema';
import {
  PullRequestRiskLevel,
  PullRequestSnapshot
} from './schemas/pull-request-snapshot.schema';
import { CreateRepositoryDto } from './dto/create-repository.dto';
import { UpdateRepositoryDto } from './dto/update-repository.dto';
import {
  ContributorSnapshotListDto,
  HotspotFileListDto,
  RepositoryAnalysisSummaryDto,
  RepositoryHealthDto,
  RepositoryRiskSummaryDto,
  ReviewBottlenecksDto,
  IssueSnapshotListDto,
  PullRequestSnapshotListDto,
  RepositorySyncSummaryDto,
  WorkloadSummaryDto
} from './dto';
import { Repository, Repository as RepositoryDocument } from './repository.schema';

type RepositoryRow = {
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

type PullRequestRow = {
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

type IssueRow = {
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

type ContributorRow = {
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

type HotspotFileRow = {
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

export interface RepositoryListResult {
  items: RepositoryRow[];
  page: number;
  pageSize: number;
  total: number;
}

@Injectable()
export class RepositoriesService {
  constructor(
    @InjectModel(Repository.name)
    private readonly repositoryModel: Model<Repository>,
    @InjectModel(PullRequestSnapshot.name)
    private readonly pullRequestSnapshotModel: Model<PullRequestSnapshot>,
    @InjectModel(IssueSnapshot.name)
    private readonly issueSnapshotModel: Model<IssueSnapshot>,
    @InjectModel(ContributorSnapshot.name)
    private readonly contributorSnapshotModel: Model<ContributorSnapshot>,
    @InjectModel(HotspotFile.name)
    private readonly hotspotFileModel: Model<HotspotFile>,
    @InjectModel(ActivityLog.name)
    private readonly activityLogModel: Model<ActivityLog>,
    private readonly githubService: GithubService
  ) {}

  private toPlain(repository: RepositoryDocument): RepositoryRow {
    return {
      id: repository.id.toString(),
      owner: repository.owner,
      name: repository.name,
      fullName: repository.fullName,
      url: repository.url,
      description: repository.description,
      language: repository.language,
      stars: repository.stars,
      forks: repository.forks,
      defaultBranch: repository.defaultBranch,
      lastSyncedAt: repository.lastSyncedAt
        ? repository.lastSyncedAt.toISOString()
        : null,
      createdAt: repository.createdAt?.toISOString() || '',
      updatedAt: repository.updatedAt?.toISOString() || ''
    };
  }

  private toPullRequestRow(snapshot: PullRequestSnapshot): PullRequestRow {
    return {
      id: snapshot.id.toString(),
      repository: snapshot.repository.toString(),
      githubId: snapshot.githubId,
      number: snapshot.number,
      title: snapshot.title,
      author: snapshot.author,
      state: snapshot.state,
      url: snapshot.url,
      createdAtGithub: snapshot.createdAtGithub.toISOString(),
      updatedAtGithub: snapshot.updatedAtGithub.toISOString(),
      closedAtGithub: snapshot.closedAtGithub?.toISOString(),
      mergedAtGithub: snapshot.mergedAtGithub?.toISOString(),
      filesChanged: snapshot.filesChanged,
      additions: snapshot.additions,
      deletions: snapshot.deletions,
      changedFileNames: snapshot.changedFileNames,
      hasDescription: snapshot.hasDescription,
      reviewCount: snapshot.reviewCount,
      isDraft: snapshot.isDraft,
      riskScore: snapshot.riskScore,
      riskLevel: snapshot.riskLevel,
      riskReasons: snapshot.riskReasons,
      syncedAt: snapshot.syncedAt.toISOString()
    };
  }

  private toIssueRow(snapshot: IssueSnapshot): IssueRow {
    return {
      id: snapshot.id.toString(),
      repository: snapshot.repository.toString(),
      githubId: snapshot.githubId,
      number: snapshot.number,
      title: snapshot.title,
      author: snapshot.author,
      assignee: snapshot.assignee,
      state: snapshot.state,
      url: snapshot.url,
      labels: snapshot.labels,
      createdAtGithub: snapshot.createdAtGithub.toISOString(),
      updatedAtGithub: snapshot.updatedAtGithub.toISOString(),
      closedAtGithub: snapshot.closedAtGithub?.toISOString(),
      isStale: snapshot.isStale,
      isCritical: snapshot.isCritical,
      syncedAt: snapshot.syncedAt.toISOString()
    };
  }

  private toContributorRow(snapshot: ContributorSnapshot): ContributorRow {
    return {
      id: snapshot.id.toString(),
      repository: snapshot.repository.toString(),
      username: snapshot.username,
      avatarUrl: snapshot.avatarUrl,
      profileUrl: snapshot.profileUrl,
      commits: snapshot.commits,
      openPrs: snapshot.openPrs,
      assignedIssues: snapshot.assignedIssues,
      pendingReviews: snapshot.pendingReviews,
      staleItems: snapshot.staleItems,
      workloadScore: snapshot.workloadScore,
      workloadLevel: snapshot.workloadLevel,
      syncedAt: snapshot.syncedAt.toISOString()
    };
  }

  private toHotspotFileRow(snapshot: HotspotFile): HotspotFileRow {
    return {
      id: snapshot.id.toString(),
      repository: snapshot.repository.toString(),
      filePath: snapshot.filePath,
      module: snapshot.module,
      changeCount: snapshot.changeCount,
      riskScore: snapshot.riskScore,
      relatedPrNumbers: snapshot.relatedPrNumbers,
      lastTouchedAt: snapshot.lastTouchedAt.toISOString(),
      analyzedAt: snapshot.analyzedAt.toISOString()
    };
  }

  private safeTrim(value: unknown, fallback = ''): string {
    return typeof value === 'string' ? value.trim() : fallback;
  }

  private toDate(value: string | undefined): Date {
    return value ? new Date(value) : new Date(0);
  }

  private getAgeDays(date: Date, now = new Date()): number {
    const msPerDay = 1000 * 60 * 60 * 24;
    return Math.floor((now.getTime() - date.getTime()) / msPerDay);
  }

  private normalizePage(value?: number): number {
    return Number.isFinite(value as number) && value! > 0 ? Math.floor(value!) : 1;
  }

  private normalizePageSize(value?: number): number {
    return Number.isFinite(value as number) && value! > 0
      ? Math.min(Math.floor(value!), 100)
      : 50;
  }

  private toObjectId(value: string): Types.ObjectId {
    try {
      return new Types.ObjectId(value);
    } catch {
      throw new NotFoundException('Repository not found');
    }
  }

  private buildFullName(owner: string, name: string) {
    const normalizedOwner = owner.trim();
    const normalizedName = name.trim();
    const fullName = `${normalizedOwner}/${normalizedName}`;
    const url = `https://github.com/${fullName}`;

    return { fullName, url };
  }

  private async getRepositoryHealthPayload(repository: RepositoryDocument): Promise<RepositoryHealthDto> {
    const [
      highRiskPrs,
      criticalPrs,
      stalePrs,
      staleIssues,
      criticalIssues,
      reviewBottlenecks,
      hotspotFiles,
      riskyHotspots,
      analyzedLog
    ] = await Promise.all([
      this.pullRequestSnapshotModel.countDocuments({
        repository: repository._id,
        riskLevel: PullRequestRiskLevel.HIGH
      }),
      this.pullRequestSnapshotModel.countDocuments({
        repository: repository._id,
        riskLevel: PullRequestRiskLevel.CRITICAL
      }),
      this.pullRequestSnapshotModel.countDocuments({
        repository: repository._id,
        state: 'open',
        createdAtGithub: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }),
      this.issueSnapshotModel.countDocuments({ repository: repository._id, isStale: true }),
      this.issueSnapshotModel.countDocuments({ repository: repository._id, isCritical: true }),
      this.pullRequestSnapshotModel.countDocuments({
        repository: repository._id,
        state: 'open',
        reviewCount: 0
      }),
      this.hotspotFileModel.countDocuments({ repository: repository._id }),
      this.hotspotFileModel.countDocuments({ repository: repository._id, riskScore: { $gte: 50 } }),
      this.activityLogModel
        .findOne({
          repository: repository._id,
          action: 'REPOSITORY_ANALYZED'
        })
        .sort({ createdAt: -1 })
        .exec()
    ]);

    const health = calculateRepositoryHealth({
      highRiskPrs,
      criticalPrs,
      stalePrs,
      staleIssues,
      criticalIssues,
      reviewBottlenecks,
      riskyHotspots
    });

    const metadata = analyzedLog?.metadata as { analyzedAt?: string } | undefined;

    return {
      repositoryId: repository.id.toString(),
      score: health.score,
      level: health.level,
      reasons: health.reasons,
      highRiskPrs,
      criticalPrs,
      stalePrs,
      staleIssues,
      criticalIssues,
      reviewBottlenecks,
      hotspotFiles,
      lastSyncedAt: repository.lastSyncedAt ? repository.lastSyncedAt.toISOString() : null,
      lastAnalyzedAt: metadata?.analyzedAt ?? null
    };
  }

  private async ensureOwned(
    id: string,
    userId: string
  ): Promise<RepositoryDocument> {
    const repository = await this.repositoryModel.findOne({
      _id: this.toObjectId(id),
      user: this.toObjectId(userId)
    });

    if (!repository) {
      throw new NotFoundException('Repository not found');
    }

    return repository;
  }

  async create(dto: CreateRepositoryDto, userId: string) {
    const { fullName, url } = this.buildFullName(dto.owner, dto.name);

    try {
      const repository = await this.repositoryModel.create({
        ...dto,
        fullName,
        url,
        stars: 0,
        forks: 0,
        lastSyncedAt: null,
        user: this.toObjectId(userId)
      });

      return this.toPlain(repository);
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new BadRequestException('Repository already exists');
      }

      throw error;
    }
  }

  async list(userId: string, page = 1, pageSize = 50): Promise<RepositoryListResult> {
    const safePage = this.normalizePage(page);
    const safePageSize = this.normalizePageSize(pageSize);

    const filter = { user: this.toObjectId(userId) };
    const skip = (safePage - 1) * safePageSize;

    const [items, total] = await Promise.all([
      this.repositoryModel
        .find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(safePageSize)
        .exec(),
      this.repositoryModel.countDocuments(filter).exec()
    ]);

    return {
      items: items.map((repository) => this.toPlain(repository)),
      page: safePage,
      pageSize: safePageSize,
      total
    };
  }

  async getById(id: string, userId: string) {
    const repository = await this.ensureOwned(id, userId);
    return this.toPlain(repository);
  }

  async getRepositoryHealth(id: string, userId: string): Promise<RepositoryHealthDto> {
    const repository = await this.ensureOwned(id, userId);
    return this.getRepositoryHealthPayload(repository);
  }

  async update(id: string, userId: string, dto: UpdateRepositoryDto) {
    const repository = await this.ensureOwned(id, userId);

    const hasNameOrOwnerChange = Boolean(dto.name || dto.owner);
    const nextOwner = (dto.owner ?? repository.owner).trim();
    const nextName = (dto.name ?? repository.name).trim();
    const nextUrlAndFullName = hasNameOrOwnerChange
      ? this.buildFullName(nextOwner, nextName)
      : null;

    try {
      const updated = await this.repositoryModel.findByIdAndUpdate(
        repository._id,
        {
          ...dto,
          ...(nextUrlAndFullName
            ? {
                owner: nextOwner,
                name: nextName,
                fullName: nextUrlAndFullName.fullName,
                url: nextUrlAndFullName.url
              }
            : {})
        },
        { new: true }
      );

      if (!updated) {
        throw new NotFoundException('Repository not found');
      }

      return this.toPlain(updated);
    } catch (error: any) {
      if (error?.code === 11000) {
        throw new BadRequestException('Repository already exists');
      }

      throw error;
    }
  }

  async delete(id: string, userId: string) {
    const repository = await this.ensureOwned(id, userId);
    await this.repositoryModel.findByIdAndDelete(repository._id);
  }

  async syncRepositoryById(
    id: string,
    userId: string
  ): Promise<RepositorySyncSummaryDto> {
    const repository = await this.ensureOwned(id, userId);

    const pullRequests = await this.githubService.fetchPullRequests(
      repository.owner,
      repository.name
    );
    const issues = await this.githubService.fetchIssues(repository.owner, repository.name);
    const contributors = await this.githubService.fetchContributors(
      repository.owner,
      repository.name
    );

    const repoDetails = await this.githubService.fetchRepository(
      repository.owner,
      repository.name
    );

    const syncedAt = new Date();

    const openPrsByAuthor = new Map<string, number>();
    const assignedIssuesByUser = new Map<string, number>();

    for (const pullRequest of pullRequests) {
      const author = this.safeTrim(pullRequest.user?.login, 'Unknown');
      const state = this.safeTrim(pullRequest.state);

      if (state.toLowerCase() === 'open') {
        openPrsByAuthor.set(author, (openPrsByAuthor.get(author) || 0) + 1);
      }
    }

    for (const issue of issues) {
      if (issue.pull_request) {
        continue;
      }

      const assignee = this.safeTrim(issue.assignee?.login);
      if (assignee) {
        assignedIssuesByUser.set(
          assignee,
          (assignedIssuesByUser.get(assignee) || 0) + 1
        );
      }
    }

    const pullRequestTasks = pullRequests.map(async (pullRequest) => {
      const githubId = Number(pullRequest.id);
      const number = Number(pullRequest.number);

      if (
        !Number.isFinite(githubId) ||
        githubId <= 0 ||
        !Number.isFinite(number) ||
        number <= 0
      ) {
        return null;
      }

      try {
        const filesAndReviews = await Promise.allSettled([
          this.githubService.fetchPullRequestFiles(
            repository.owner,
            repository.name,
            number
          ),
          this.githubService.fetchPullRequestReviews(
            repository.owner,
            repository.name,
            number
          )
        ]);

        const files = filesAndReviews[0].status === 'fulfilled' ? filesAndReviews[0].value : [];
        const reviews = filesAndReviews[1].status === 'fulfilled' ? filesAndReviews[1].value : [];

        const filesChanged = files.length;
        const additions = files.reduce(
          (acc, file) => acc + Number(file.additions || 0),
          0
        );
        const deletions = files.reduce(
          (acc, file) => acc + Number(file.deletions || 0),
          0
        );
        const changedFileNames = files
          .map((file) => this.safeTrim(file.filename))
          .filter(Boolean);

        const author = this.safeTrim(pullRequest.user?.login, 'Unknown');

        await this.pullRequestSnapshotModel.updateOne(
          { repository: repository._id, githubId },
          {
            $set: {
              number,
              title: this.safeTrim(pullRequest.title, 'Untitled PR'),
              author,
              state: this.safeTrim(pullRequest.state, 'unknown'),
              url: this.safeTrim(pullRequest.html_url, ''),
              createdAtGithub: this.toDate(pullRequest.created_at),
              updatedAtGithub: this.toDate(pullRequest.updated_at),
              closedAtGithub: pullRequest.closed_at
                ? this.toDate(pullRequest.closed_at)
                : undefined,
              mergedAtGithub: pullRequest.merged_at
                ? this.toDate(pullRequest.merged_at)
                : undefined,
              filesChanged,
              additions,
              deletions,
              changedFileNames,
              hasDescription: Boolean(this.safeTrim(pullRequest.body)),
              reviewCount: reviews.length,
              isDraft: Boolean(pullRequest.draft),
              riskScore: 0,
              riskLevel: PullRequestRiskLevel.LOW,
              riskReasons: [],
              syncedAt,
              repository: repository._id
            }
          },
          { upsert: true }
        );

        return { type: 'pr', id: githubId };
      } catch {
        return null;
      }
    });

    const issueTasks = issues
      .filter((issue) => !issue.pull_request)
      .map((issue) => {
        const githubId = Number(issue.id);
        const number = Number(issue.number);

        if (
          !Number.isFinite(githubId) ||
          githubId <= 0 ||
          !Number.isFinite(number) ||
          number <= 0
        ) {
          return Promise.resolve(null);
        }

        const labels = (issue.labels || [])
          .map((label) =>
            this.githubService.getNormalizedLabelName(label as { name?: string } | string)
          )
          .filter(Boolean);

        return this.issueSnapshotModel.updateOne(
          { repository: repository._id, githubId },
          {
            $set: {
              number,
              title: this.safeTrim(issue.title, 'Untitled issue'),
              author: this.safeTrim(issue.user?.login, 'Unknown'),
              assignee: this.safeTrim(issue.assignee?.login) || undefined,
              state: this.safeTrim(issue.state, 'unknown'),
              url: this.safeTrim(issue.html_url, ''),
              labels,
              createdAtGithub: this.toDate(issue.created_at),
              updatedAtGithub: this.toDate(issue.updated_at),
              closedAtGithub: issue.closed_at
                ? this.toDate(issue.closed_at)
                : undefined,
              isStale: false,
              isCritical: false,
              syncedAt,
              repository: repository._id
            }
          },
          { upsert: true }
        );
      });

    const contributorTasks = contributors.map((contributor) => {
      const username = this.safeTrim(contributor.login);
      if (!username) {
        return Promise.resolve(null);
      }

      const openPrs = openPrsByAuthor.get(username) || 0;
      const assignedIssues = assignedIssuesByUser.get(username) || 0;

      return this.contributorSnapshotModel.updateOne(
        { repository: repository._id, username },
        {
          $set: {
            avatarUrl: this.safeTrim(contributor.avatar_url) || undefined,
            profileUrl: this.safeTrim(contributor.html_url) || undefined,
            commits: Number(contributor.contributions || 0),
            openPrs,
            assignedIssues,
            pendingReviews: 0,
            staleItems: 0,
            workloadScore: 0,
            workloadLevel: ContributorWorkloadLevel.BALANCED,
            syncedAt,
            repository: repository._id
          }
        },
        { upsert: true }
      );
    });

    const [prResults, issueResults, contributorResults] = await Promise.all([
      Promise.allSettled(pullRequestTasks),
      Promise.all(issueTasks),
      Promise.all(contributorTasks)
    ]);

    const pullRequestsSynced = prResults
      .filter(
        (result) => result.status === 'fulfilled' && Boolean(result.value)
      )
      .length;

    const issuesSynced = issueResults.filter(Boolean).length;
    const contributorsSynced = contributorResults.filter(Boolean).length;

    await this.repositoryModel.findByIdAndUpdate(repository._id, {
      description: this.safeTrim(repoDetails.description, repository.description || ''),
      language: this.safeTrim(repoDetails.language, repository.language || ''),
      stars: Number(repoDetails.stargazers_count ?? repository.stars),
      forks: Number(repoDetails.forks_count ?? repository.forks),
      defaultBranch: this.safeTrim(
        repoDetails.default_branch,
        repository.defaultBranch || 'main'
      ),
      lastSyncedAt: syncedAt
    });

    await this.activityLogModel.create({
      user: this.toObjectId(userId),
      repository: repository._id,
      action: 'REPOSITORY_SYNCED',
      entity: 'repository',
      entityId: repository.id.toString(),
      metadata: {
        repositoryId: repository.id.toString(),
        pullRequestsSynced,
        issuesSynced,
        contributorsSynced,
        syncedAt: syncedAt.toISOString()
      }
    });

    return {
      repositoryId: repository.id.toString(),
      syncedAt: syncedAt.toISOString(),
      pullRequestsSynced,
      issuesSynced,
      contributorsSynced,
      message: 'Repository synced successfully'
    };
  }

  async listPullRequestSnapshots(
    repositoryId: string,
    userId: string,
    page = 1,
    pageSize = 50
  ): Promise<PullRequestSnapshotListDto> {
    const repository = await this.ensureOwned(repositoryId, userId);
    const safePage = this.normalizePage(page);
    const safePageSize = this.normalizePageSize(pageSize);
    const skip = (safePage - 1) * safePageSize;

    const filter = { repository: repository._id };
    const [items, total] = await Promise.all([
      this.pullRequestSnapshotModel
        .find(filter)
        .sort({ syncedAt: -1 })
        .skip(skip)
        .limit(safePageSize)
        .exec(),
      this.pullRequestSnapshotModel.countDocuments(filter).exec()
    ]);

    return {
      items: items.map((row) => this.toPullRequestRow(row)),
      page: safePage,
      pageSize: safePageSize,
      total
    };
  }

  async listIssueSnapshots(
    repositoryId: string,
    userId: string,
    page = 1,
    pageSize = 50
  ): Promise<IssueSnapshotListDto> {
    const repository = await this.ensureOwned(repositoryId, userId);
    const safePage = this.normalizePage(page);
    const safePageSize = this.normalizePageSize(pageSize);
    const skip = (safePage - 1) * safePageSize;

    const filter = { repository: repository._id };
    const [items, total] = await Promise.all([
      this.issueSnapshotModel
        .find(filter)
        .sort({ syncedAt: -1 })
        .skip(skip)
        .limit(safePageSize)
        .exec(),
      this.issueSnapshotModel.countDocuments(filter).exec()
    ]);

    return {
      items: items.map((row) => this.toIssueRow(row)),
      page: safePage,
      pageSize: safePageSize,
      total
    };
  }

  async listContributorSnapshots(
    repositoryId: string,
    userId: string,
    page = 1,
    pageSize = 50
  ): Promise<ContributorSnapshotListDto> {
    const repository = await this.ensureOwned(repositoryId, userId);
    const safePage = this.normalizePage(page);
    const safePageSize = this.normalizePageSize(pageSize);
    const skip = (safePage - 1) * safePageSize;

    const filter = { repository: repository._id };
    const [items, total] = await Promise.all([
      this.contributorSnapshotModel
        .find(filter)
        .sort({ syncedAt: -1 })
        .skip(skip)
        .limit(safePageSize)
        .exec(),
      this.contributorSnapshotModel.countDocuments(filter).exec()
    ]);

    return {
      items: items.map((row) => this.toContributorRow(row)),
      page: safePage,
      pageSize: safePageSize,
      total
    };
  }

  async analyzeRepositoryById(
    repositoryId: string,
    userId: string
  ): Promise<RepositoryAnalysisSummaryDto> {
    const repository = await this.ensureOwned(repositoryId, userId);

    if (!repository.lastSyncedAt) {
      throw new BadRequestException('Repository must be synced before analysis.');
    }

    const analyzedAt = new Date();
    const [pullRequests, issues, contributors] = await Promise.all([
      this.pullRequestSnapshotModel.find({ repository: repository._id }).exec(),
      this.issueSnapshotModel.find({ repository: repository._id }).exec(),
      this.contributorSnapshotModel.find({ repository: repository._id }).exec()
    ]);

    const prRiskResults = await Promise.all(
      pullRequests.map(async (pullRequest) => {
        const result = calculatePullRequestRisk({
          createdAtGithub: pullRequest.createdAtGithub,
          filesChanged: pullRequest.filesChanged,
          additions: pullRequest.additions,
          deletions: pullRequest.deletions,
          changedFileNames: pullRequest.changedFileNames,
          hasDescription: pullRequest.hasDescription,
          reviewCount: pullRequest.reviewCount,
          isDraft: pullRequest.isDraft
        });

        await this.pullRequestSnapshotModel.updateOne(
          { _id: pullRequest._id },
          {
            riskScore: result.score,
            riskLevel: result.level as PullRequestRiskLevel,
            riskReasons: result.reasons
          }
        );

        return result;
      })
    );

    const issueResults = await Promise.all(
      issues.map(async (issue) => {
        const result = analyzeIssue({
          state: issue.state,
          labels: issue.labels,
          createdAtGithub: issue.createdAtGithub,
          updatedAtGithub: issue.updatedAtGithub
        });

        await this.issueSnapshotModel.updateOne(
          { _id: issue._id },
          {
            isStale: result.isStale,
            isCritical: result.isCritical
          }
        );

        return {
          issue,
          ...result
        };
      })
    );

    const openUnreviewedPrs = pullRequests.filter(
      (pullRequest) =>
        pullRequest.state.toLowerCase() === 'open' && pullRequest.reviewCount === 0
    );

    const workloadResults = await Promise.all(
      contributors.map(async (contributor) => {
        const username = contributor.username;
        const authoredOpenPrs = pullRequests.filter(
          (pullRequest) =>
            pullRequest.author === username && pullRequest.state.toLowerCase() === 'open'
        );
        const assignedOpenIssues = issueResults.filter(
          (issueResult) =>
            issueResult.issue.assignee === username &&
            issueResult.issue.state.toLowerCase() === 'open'
        );
        const pendingReviews = openUnreviewedPrs.filter(
          (pullRequest) => pullRequest.author !== username
        ).length;
        const staleItems =
          authoredOpenPrs.filter((pullRequest) => this.getAgeDays(pullRequest.createdAtGithub) > 7)
            .length + assignedOpenIssues.filter((issueResult) => issueResult.isStale).length;

        const result = calculateWorkloadScore({
          openPrs: authoredOpenPrs.length,
          assignedIssues: assignedOpenIssues.length,
          pendingReviews,
          staleItems
        });

        await this.contributorSnapshotModel.updateOne(
          { _id: contributor._id },
          {
            openPrs: authoredOpenPrs.length,
            assignedIssues: assignedOpenIssues.length,
            pendingReviews,
            staleItems,
            workloadScore: result.score,
            workloadLevel: result.level as ContributorWorkloadLevel
          }
        );

        return result;
      })
    );

    const hotspots = analyzeHotspots(
      pullRequests.map((pullRequest) => ({
        number: pullRequest.number,
        changedFileNames: pullRequest.changedFileNames,
        updatedAtGithub: pullRequest.updatedAtGithub
      }))
    );

    await Promise.all(
      hotspots.map((hotspot) =>
        this.hotspotFileModel.updateOne(
          { repository: repository._id, filePath: hotspot.filePath },
          {
            repository: repository._id,
            filePath: hotspot.filePath,
            module: hotspot.module,
            changeCount: hotspot.changeCount,
            riskScore: hotspot.riskScore,
            relatedPrNumbers: hotspot.relatedPrNumbers,
            lastTouchedAt: hotspot.lastTouchedAt,
            analyzedAt
          },
          { upsert: true }
        )
      )
    );

    await this.hotspotFileModel.deleteMany({
      repository: repository._id,
      ...(hotspots.length > 0
        ? { filePath: { $nin: hotspots.map((hotspot) => hotspot.filePath) } }
        : {})
    });

    const highRiskPrs = prRiskResults.filter((risk) => risk.level === 'HIGH').length;
    const criticalPrs = prRiskResults.filter((risk) => risk.level === 'CRITICAL').length;
    const staleIssues = issueResults.filter((issue) => issue.isStale).length;
    const criticalIssues = issueResults.filter((issue) => issue.isCritical).length;

    await this.activityLogModel.create({
      user: this.toObjectId(userId),
      repository: repository._id,
      action: 'REPOSITORY_ANALYZED',
      entity: 'repository',
      entityId: repository.id.toString(),
      metadata: {
        repositoryId: repository.id.toString(),
        analyzedAt: analyzedAt.toISOString(),
        pullRequestsAnalyzed: pullRequests.length,
        highRiskPrs,
        criticalPrs,
        staleIssues,
        criticalIssues,
        contributorsAnalyzed: workloadResults.length,
        hotspotFiles: hotspots.length
      }
    });

    return {
      repositoryId: repository.id.toString(),
      analyzedAt: analyzedAt.toISOString(),
      pullRequestsAnalyzed: pullRequests.length,
      highRiskPrs,
      criticalPrs,
      staleIssues,
      criticalIssues,
      contributorsAnalyzed: workloadResults.length,
      hotspotFiles: hotspots.length,
      message: 'Repository analyzed successfully'
    };
  }

  async getRiskSummary(repositoryId: string, userId: string): Promise<RepositoryRiskSummaryDto> {
    const repository = await this.ensureOwned(repositoryId, userId);

    const [
      highRiskPrs,
      criticalPrs,
      staleIssues,
      criticalIssues,
      hotspotFiles,
      busyContributors,
      overloadedContributors,
      atRiskContributors
    ] = await Promise.all([
      this.pullRequestSnapshotModel.countDocuments({
        repository: repository._id,
        riskLevel: PullRequestRiskLevel.HIGH
      }),
      this.pullRequestSnapshotModel.countDocuments({
        repository: repository._id,
        riskLevel: PullRequestRiskLevel.CRITICAL
      }),
      this.issueSnapshotModel.countDocuments({ repository: repository._id, isStale: true }),
      this.issueSnapshotModel.countDocuments({ repository: repository._id, isCritical: true }),
      this.hotspotFileModel.countDocuments({ repository: repository._id }),
      this.contributorSnapshotModel.countDocuments({
        repository: repository._id,
        workloadLevel: ContributorWorkloadLevel.BUSY
      }),
      this.contributorSnapshotModel.countDocuments({
        repository: repository._id,
        workloadLevel: ContributorWorkloadLevel.OVERLOADED
      }),
      this.contributorSnapshotModel.countDocuments({
        repository: repository._id,
        workloadLevel: ContributorWorkloadLevel.AT_RISK
      })
    ]);

    return {
      highRiskPrs,
      criticalPrs,
      staleIssues,
      criticalIssues,
      hotspotFiles,
      busyContributors,
      overloadedContributors,
      atRiskContributors
    };
  }

  async listHotspots(
    repositoryId: string,
    userId: string,
    page = 1,
    pageSize = 50
  ): Promise<HotspotFileListDto> {
    const repository = await this.ensureOwned(repositoryId, userId);
    const safePage = this.normalizePage(page);
    const safePageSize = this.normalizePageSize(pageSize);
    const skip = (safePage - 1) * safePageSize;
    const filter = { repository: repository._id };

    const [items, total] = await Promise.all([
      this.hotspotFileModel
        .find(filter)
        .sort({ riskScore: -1, changeCount: -1 })
        .skip(skip)
        .limit(safePageSize)
        .exec(),
      this.hotspotFileModel.countDocuments(filter).exec()
    ]);

    return {
      items: items.map((item) => this.toHotspotFileRow(item)),
      page: safePage,
      pageSize: safePageSize,
      total
    };
  }

  async getReviewBottlenecks(
    repositoryId: string,
    userId: string
  ): Promise<ReviewBottlenecksDto> {
    const repository = await this.ensureOwned(repositoryId, userId);
    const now = new Date();
    const pullRequests = await this.pullRequestSnapshotModel
      .find({
        repository: repository._id,
        state: 'open',
        reviewCount: 0
      })
      .sort({ createdAtGithub: 1 })
      .exec();

    const items = pullRequests.map((pullRequest) => ({
      id: pullRequest.id.toString(),
      number: pullRequest.number,
      title: pullRequest.title,
      author: pullRequest.author,
      url: pullRequest.url,
      ageDays: this.getAgeDays(pullRequest.createdAtGithub, now),
      filesChanged: pullRequest.filesChanged,
      riskScore: pullRequest.riskScore,
      riskLevel: pullRequest.riskLevel
    }));

    const totalAge = items.reduce((sum, item) => sum + item.ageDays, 0);

    return {
      totalUnreviewedPrs: items.length,
      staleUnreviewedPrs: items.filter((item) => item.ageDays > 3).length,
      oldestUnreviewedPr: items[0],
      averageAgeDays: items.length ? Math.round((totalAge / items.length) * 10) / 10 : 0,
      items
    };
  }

  async getWorkloadSummary(
    repositoryId: string,
    userId: string
  ): Promise<WorkloadSummaryDto> {
    const repository = await this.ensureOwned(repositoryId, userId);
    const contributors = await this.contributorSnapshotModel
      .find({ repository: repository._id })
      .sort({ workloadScore: -1 })
      .exec();

    return {
      totals: {
        balanced: contributors.filter(
          (contributor) => contributor.workloadLevel === ContributorWorkloadLevel.BALANCED
        ).length,
        busy: contributors.filter(
          (contributor) => contributor.workloadLevel === ContributorWorkloadLevel.BUSY
        ).length,
        overloaded: contributors.filter(
          (contributor) => contributor.workloadLevel === ContributorWorkloadLevel.OVERLOADED
        ).length,
        atRisk: contributors.filter(
          (contributor) => contributor.workloadLevel === ContributorWorkloadLevel.AT_RISK
        ).length
      },
      items: contributors.map((contributor) => ({
        id: contributor.id.toString(),
        username: contributor.username,
        commits: contributor.commits,
        openPrs: contributor.openPrs,
        assignedIssues: contributor.assignedIssues,
        pendingReviews: contributor.pendingReviews,
        staleItems: contributor.staleItems,
        workloadScore: contributor.workloadScore,
        workloadLevel: contributor.workloadLevel
      }))
    };
  }
}
