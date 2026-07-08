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

    const stalePrCutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const [
      prSummaryRows,
      issueSummaryRows,
      contributorSummaryRows,
      hotspotSummaryRows,
      hotspotModuleRows
    ] = await Promise.all([
      this.pullRequestSnapshotModel.aggregate<{
        _id: Types.ObjectId;
        low: number;
        medium: number;
        high: number;
        critical: number;
        stale: number;
        reviewBottlenecks: number;
      }>([
        { $match: { repository: { $in: repositoryIds } } },
        {
          $group: {
            _id: '$repository',
            low: { $sum: { $cond: [{ $eq: ['$riskLevel', PullRequestRiskLevel.LOW] }, 1, 0] } },
            medium: { $sum: { $cond: [{ $eq: ['$riskLevel', PullRequestRiskLevel.MEDIUM] }, 1, 0] } },
            high: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ['$state', 'open'] }, { $eq: ['$riskLevel', PullRequestRiskLevel.HIGH] }] },
                  1,
                  0
                ]
              }
            },
            critical: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ['$state', 'open'] }, { $eq: ['$riskLevel', PullRequestRiskLevel.CRITICAL] }] },
                  1,
                  0
                ]
              }
            },
            stale: {
              $sum: {
                $cond: [
                  { $and: [{ $eq: ['$state', 'open'] }, { $lt: ['$createdAtGithub', stalePrCutoff] }] },
                  1,
                  0
                ]
              }
            },
            reviewBottlenecks: {
              $sum: {
                $cond: [{ $and: [{ $eq: ['$state', 'open'] }, { $eq: ['$reviewCount', 0] }] }, 1, 0]
              }
            }
          }
        }
      ]),
      this.issueSnapshotModel.aggregate<{
        _id: Types.ObjectId;
        open: number;
        stale: number;
        critical: number;
      }>([
        { $match: { repository: { $in: repositoryIds } } },
        {
          $group: {
            _id: '$repository',
            open: { $sum: { $cond: [{ $eq: ['$state', 'open'] }, 1, 0] } },
            stale: { $sum: { $cond: ['$isStale', 1, 0] } },
            critical: { $sum: { $cond: ['$isCritical', 1, 0] } }
          }
        }
      ]),
      this.contributorSnapshotModel.aggregate<{
        _id: Types.ObjectId;
        balanced: number;
        busy: number;
        overloaded: number;
        atRisk: number;
      }>([
        { $match: { repository: { $in: repositoryIds } } },
        {
          $group: {
            _id: '$repository',
            balanced: { $sum: { $cond: [{ $eq: ['$workloadLevel', ContributorWorkloadLevel.BALANCED] }, 1, 0] } },
            busy: { $sum: { $cond: [{ $eq: ['$workloadLevel', ContributorWorkloadLevel.BUSY] }, 1, 0] } },
            overloaded: { $sum: { $cond: [{ $eq: ['$workloadLevel', ContributorWorkloadLevel.OVERLOADED] }, 1, 0] } },
            atRisk: { $sum: { $cond: [{ $eq: ['$workloadLevel', ContributorWorkloadLevel.AT_RISK] }, 1, 0] } }
          }
        }
      ]),
      this.hotspotFileModel.aggregate<{
        _id: Types.ObjectId;
        total: number;
        risky: number;
      }>([
        { $match: { repository: { $in: repositoryIds } } },
        {
          $group: {
            _id: '$repository',
            total: { $sum: 1 },
            risky: { $sum: { $cond: [{ $gte: ['$riskScore', 50] }, 1, 0] } }
          }
        }
      ]),
      this.hotspotFileModel.aggregate<{ _id: string; count: number }>([
        { $match: { repository: { $in: repositoryIds } } },
        { $group: { _id: '$module', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 8 }
      ])
    ]);

    const prSummaryMap = new Map(prSummaryRows.map((row) => [row._id.toString(), row]));
    const issueSummaryMap = new Map(issueSummaryRows.map((row) => [row._id.toString(), row]));
    const hotspotSummaryMap = new Map(hotspotSummaryRows.map((row) => [row._id.toString(), row]));

    const lowPrs = prSummaryRows.reduce((sum, row) => sum + row.low, 0);
    const mediumPrs = prSummaryRows.reduce((sum, row) => sum + row.medium, 0);
    const highRiskPrs = prSummaryRows.reduce((sum, row) => sum + row.high, 0);
    const criticalPrs = prSummaryRows.reduce((sum, row) => sum + row.critical, 0);
    const stalePrs = prSummaryRows.reduce((sum, row) => sum + row.stale, 0);
    const reviewBottlenecks = prSummaryRows.reduce((sum, row) => sum + row.reviewBottlenecks, 0);
    const openIssues = issueSummaryRows.reduce((sum, row) => sum + row.open, 0);
    const staleIssues = issueSummaryRows.reduce((sum, row) => sum + row.stale, 0);
    const criticalIssues = issueSummaryRows.reduce((sum, row) => sum + row.critical, 0);
    const balancedContributors = contributorSummaryRows.reduce((sum, row) => sum + row.balanced, 0);
    const busyContributors = contributorSummaryRows.reduce((sum, row) => sum + row.busy, 0);
    const overloadedContributors = contributorSummaryRows.reduce((sum, row) => sum + row.overloaded, 0);
    const atRiskContributors = contributorSummaryRows.reduce((sum, row) => sum + row.atRisk, 0);
    const hotspotFiles = hotspotSummaryRows.reduce((sum, row) => sum + row.total, 0);

    const repositoryRows = repositories.map((repository) => {
        const repositoryObjectId = repository._id as Types.ObjectId;
        const prSummary = prSummaryMap.get(repositoryObjectId.toString());
        const issueSummary = issueSummaryMap.get(repositoryObjectId.toString());
        const hotspotSummary = hotspotSummaryMap.get(repositoryObjectId.toString());
        const repoHighRiskPrs = prSummary?.high || 0;
        const repoCriticalPrs = prSummary?.critical || 0;
        const repoStalePrs = prSummary?.stale || 0;
        const repoStaleIssues = issueSummary?.stale || 0;
        const repoCriticalIssues = issueSummary?.critical || 0;
        const repoReviewBottlenecks = prSummary?.reviewBottlenecks || 0;
        const repoHotspotFiles = hotspotSummary?.total || 0;
        const repoRiskyHotspots = hotspotSummary?.risky || 0;

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
      });

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
