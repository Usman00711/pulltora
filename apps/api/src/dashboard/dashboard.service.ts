import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { calculateRepositoryHealth } from '../common/intelligence/health-score';
import { ContributorSnapshot, ContributorWorkloadLevel } from '../repositories/schemas/contributor-snapshot.schema';
import { HotspotFile } from '../repositories/schemas/hotspot-file.schema';
import { IssueSnapshot } from '../repositories/schemas/issue-snapshot.schema';
import { PullRequestRiskLevel, PullRequestSnapshot } from '../repositories/schemas/pull-request-snapshot.schema';
import { Repository } from '../repositories/repository.schema';
import { DashboardIntelligenceDto } from './dto/dashboard-intelligence.dto';

@Injectable()
export class DashboardService {
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
    private readonly hotspotFileModel: Model<HotspotFile>
  ) {}

  private point(name: string, value: number) {
    return { name, value };
  }

  async getIntelligence(userId: string): Promise<DashboardIntelligenceDto> {
    const repositories = await this.repositoryModel
      .find({ user: new Types.ObjectId(userId) })
      .sort({ updatedAt: -1 })
      .exec();
    const repositoryIds = repositories.map((repository) => repository._id);

    const [
      lowPrs,
      mediumPrs,
      highRiskPrs,
      criticalPrs,
      openIssues,
      staleIssues,
      criticalIssues,
      balancedContributors,
      busyContributors,
      overloadedContributors,
      atRiskContributors,
      hotspotFiles,
      riskyHotspots,
      reviewBottlenecks,
      stalePrs,
      hotspotModuleRows
    ] = await Promise.all([
      this.pullRequestSnapshotModel.countDocuments({ repository: { $in: repositoryIds }, riskLevel: PullRequestRiskLevel.LOW }),
      this.pullRequestSnapshotModel.countDocuments({ repository: { $in: repositoryIds }, riskLevel: PullRequestRiskLevel.MEDIUM }),
      this.pullRequestSnapshotModel.countDocuments({ repository: { $in: repositoryIds }, riskLevel: PullRequestRiskLevel.HIGH }),
      this.pullRequestSnapshotModel.countDocuments({ repository: { $in: repositoryIds }, riskLevel: PullRequestRiskLevel.CRITICAL }),
      this.issueSnapshotModel.countDocuments({ repository: { $in: repositoryIds }, state: 'open' }),
      this.issueSnapshotModel.countDocuments({ repository: { $in: repositoryIds }, isStale: true }),
      this.issueSnapshotModel.countDocuments({ repository: { $in: repositoryIds }, isCritical: true }),
      this.contributorSnapshotModel.countDocuments({ repository: { $in: repositoryIds }, workloadLevel: ContributorWorkloadLevel.BALANCED }),
      this.contributorSnapshotModel.countDocuments({ repository: { $in: repositoryIds }, workloadLevel: ContributorWorkloadLevel.BUSY }),
      this.contributorSnapshotModel.countDocuments({ repository: { $in: repositoryIds }, workloadLevel: ContributorWorkloadLevel.OVERLOADED }),
      this.contributorSnapshotModel.countDocuments({ repository: { $in: repositoryIds }, workloadLevel: ContributorWorkloadLevel.AT_RISK }),
      this.hotspotFileModel.countDocuments({ repository: { $in: repositoryIds } }),
      this.hotspotFileModel.countDocuments({ repository: { $in: repositoryIds }, riskScore: { $gte: 50 } }),
      this.pullRequestSnapshotModel.countDocuments({ repository: { $in: repositoryIds }, state: 'open', reviewCount: 0 }),
      this.pullRequestSnapshotModel.countDocuments({
        repository: { $in: repositoryIds },
        state: 'open',
        createdAtGithub: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
      }),
      this.hotspotFileModel.aggregate<{ _id: string; count: number }>([
        { $match: { repository: { $in: repositoryIds } } },
        { $group: { _id: '$module', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ])
    ]);

    const repositoryRows = await Promise.all(
      repositories.map(async (repository) => {
        const [
          repoHighRiskPrs,
          repoCriticalPrs,
          repoStalePrs,
          repoStaleIssues,
          repoCriticalIssues,
          repoReviewBottlenecks,
          repoHotspotFiles,
          repoRiskyHotspots
        ] = await Promise.all([
          this.pullRequestSnapshotModel.countDocuments({ repository: repository._id, riskLevel: PullRequestRiskLevel.HIGH }),
          this.pullRequestSnapshotModel.countDocuments({ repository: repository._id, riskLevel: PullRequestRiskLevel.CRITICAL }),
          this.pullRequestSnapshotModel.countDocuments({
            repository: repository._id,
            state: 'open',
            createdAtGithub: { $lt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
          }),
          this.issueSnapshotModel.countDocuments({ repository: repository._id, isStale: true }),
          this.issueSnapshotModel.countDocuments({ repository: repository._id, isCritical: true }),
          this.pullRequestSnapshotModel.countDocuments({ repository: repository._id, state: 'open', reviewCount: 0 }),
          this.hotspotFileModel.countDocuments({ repository: repository._id }),
          this.hotspotFileModel.countDocuments({ repository: repository._id, riskScore: { $gte: 50 } })
        ]);

        const health = calculateRepositoryHealth({
          highRiskPrs: repoHighRiskPrs,
          criticalPrs: repoCriticalPrs,
          stalePrs: repoStalePrs,
          staleIssues: repoStaleIssues,
          criticalIssues: repoCriticalIssues,
          reviewBottlenecks: repoReviewBottlenecks,
          riskyHotspots: repoRiskyHotspots
        });

        return {
          repositoryId: repository.id.toString(),
          fullName: repository.fullName,
          score: health.score,
          level: health.level,
          highRiskPrs: repoHighRiskPrs,
          criticalIssues: repoCriticalIssues,
          reviewBottlenecks: repoReviewBottlenecks,
          hotspotFiles: repoHotspotFiles,
          lastSyncedAt: repository.lastSyncedAt ? repository.lastSyncedAt.toISOString() : null
        };
      })
    );

    const averageHealth = repositoryRows.length
      ? Math.round(repositoryRows.reduce((sum, repository) => sum + repository.score, 0) / repositoryRows.length)
      : 100;

    const topRisks = repositoryRows
      .filter((repository) => repository.score < 85)
      .sort((a, b) => a.score - b.score)
      .slice(0, 5)
      .map((repository) => `${repository.fullName}: ${repository.level} (${repository.score})`);

    return {
      totals: {
        repositories: repositories.length,
        averageHealth,
        highRiskPrs,
        criticalPrs,
        staleIssues,
        criticalIssues,
        reviewBottlenecks,
        hotspotFiles
      },
      repositories: repositoryRows,
      prRiskDistribution: [
        this.point('LOW', lowPrs),
        this.point('MEDIUM', mediumPrs),
        this.point('HIGH', highRiskPrs),
        this.point('CRITICAL', criticalPrs)
      ],
      issueDistribution: [
        this.point('Open', openIssues),
        this.point('Stale', staleIssues),
        this.point('Critical', criticalIssues)
      ],
      workloadDistribution: [
        this.point('Balanced', balancedContributors),
        this.point('Busy', busyContributors),
        this.point('Overloaded', overloadedContributors),
        this.point('At Risk', atRiskContributors)
      ],
      hotspotModules: hotspotModuleRows.map((row) => this.point(row._id || 'Core', row.count)),
      topRisks: topRisks.length ? topRisks : ['No major delivery risks detected']
    };
  }
}

