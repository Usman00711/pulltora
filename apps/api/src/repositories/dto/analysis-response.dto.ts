import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { HealthLevel } from '../../common/intelligence/health-score';
import { ContributorWorkloadLevel } from '../schemas/contributor-snapshot.schema';

export class RepositoryAnalysisSummaryDto {
  @ApiProperty()
  repositoryId!: string;

  @ApiProperty()
  analyzedAt!: string;

  @ApiProperty()
  pullRequestsAnalyzed!: number;

  @ApiProperty()
  highRiskPrs!: number;

  @ApiProperty()
  criticalPrs!: number;

  @ApiProperty()
  staleIssues!: number;

  @ApiProperty()
  criticalIssues!: number;

  @ApiProperty()
  contributorsAnalyzed!: number;

  @ApiProperty()
  hotspotFiles!: number;

  @ApiProperty()
  message!: string;
}

export class HotspotFileDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  repository!: string;

  @ApiProperty()
  filePath!: string;

  @ApiProperty()
  module!: string;

  @ApiProperty()
  changeCount!: number;

  @ApiProperty()
  riskScore!: number;

  @ApiProperty({ type: [Number] })
  relatedPrNumbers!: number[];

  @ApiProperty()
  lastTouchedAt!: string;

  @ApiProperty()
  analyzedAt!: string;
}

export class HotspotFileListDto {
  @ApiProperty({ type: [HotspotFileDto] })
  items!: HotspotFileDto[];

  @ApiProperty()
  page!: number;

  @ApiProperty()
  pageSize!: number;

  @ApiProperty()
  total!: number;
}

export class RepositoryRiskSummaryDto {
  @ApiProperty()
  highRiskPrs!: number;

  @ApiProperty()
  criticalPrs!: number;

  @ApiProperty()
  staleIssues!: number;

  @ApiProperty()
  criticalIssues!: number;

  @ApiProperty()
  hotspotFiles!: number;

  @ApiProperty()
  busyContributors!: number;

  @ApiProperty()
  overloadedContributors!: number;

  @ApiProperty()
  atRiskContributors!: number;
}

export class ReviewBottleneckItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  number!: number;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  author!: string;

  @ApiProperty()
  url!: string;

  @ApiProperty()
  ageDays!: number;

  @ApiProperty()
  filesChanged!: number;

  @ApiProperty()
  riskScore!: number;

  @ApiProperty()
  riskLevel!: string;
}

export class ReviewBottlenecksDto {
  @ApiProperty()
  totalUnreviewedPrs!: number;

  @ApiProperty()
  staleUnreviewedPrs!: number;

  @ApiPropertyOptional({ type: ReviewBottleneckItemDto })
  oldestUnreviewedPr?: ReviewBottleneckItemDto;

  @ApiProperty()
  averageAgeDays!: number;

  @ApiProperty({ type: [ReviewBottleneckItemDto] })
  items!: ReviewBottleneckItemDto[];
}

export class WorkloadSummaryTotalsDto {
  @ApiProperty()
  balanced!: number;

  @ApiProperty()
  busy!: number;

  @ApiProperty()
  overloaded!: number;

  @ApiProperty()
  atRisk!: number;
}

export class WorkloadSummaryItemDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  username!: string;

  @ApiProperty()
  commits!: number;

  @ApiProperty()
  openPrs!: number;

  @ApiProperty()
  assignedIssues!: number;

  @ApiProperty()
  pendingReviews!: number;

  @ApiProperty()
  staleItems!: number;

  @ApiProperty()
  workloadScore!: number;

  @ApiProperty({ enum: ContributorWorkloadLevel })
  workloadLevel!: ContributorWorkloadLevel;
}

export class WorkloadSummaryDto {
  @ApiProperty({ type: WorkloadSummaryTotalsDto })
  totals!: WorkloadSummaryTotalsDto;

  @ApiProperty({ type: [WorkloadSummaryItemDto] })
  items!: WorkloadSummaryItemDto[];
}

export class RepositoryHealthDto {
  @ApiProperty()
  repositoryId!: string;

  @ApiProperty()
  score!: number;

  @ApiProperty({ enum: ['EXCELLENT', 'STABLE', 'WATCH', 'AT_RISK'] })
  level!: HealthLevel;

  @ApiProperty({ type: [String] })
  reasons!: string[];

  @ApiProperty()
  highRiskPrs!: number;

  @ApiProperty()
  criticalPrs!: number;

  @ApiProperty()
  stalePrs!: number;

  @ApiProperty()
  staleIssues!: number;

  @ApiProperty()
  criticalIssues!: number;

  @ApiProperty()
  reviewBottlenecks!: number;

  @ApiProperty()
  hotspotFiles!: number;

  @ApiPropertyOptional({ nullable: true })
  lastSyncedAt?: string | null;

  @ApiPropertyOptional({ nullable: true })
  lastAnalyzedAt?: string | null;
}
