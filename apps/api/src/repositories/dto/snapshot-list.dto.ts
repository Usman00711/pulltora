import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { PullRequestRiskLevel } from '../schemas/pull-request-snapshot.schema';
import { ContributorWorkloadLevel } from '../schemas/contributor-snapshot.schema';

export class PullRequestSnapshotDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  repository!: string;

  @ApiProperty()
  githubId!: number;

  @ApiProperty()
  number!: number;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  author!: string;

  @ApiProperty()
  state!: string;

  @ApiProperty()
  url!: string;

  @ApiProperty()
  createdAtGithub!: string;

  @ApiProperty()
  updatedAtGithub!: string;

  @ApiPropertyOptional()
  closedAtGithub?: string;

  @ApiPropertyOptional()
  mergedAtGithub?: string;

  @ApiProperty({ default: 0 })
  filesChanged!: number;

  @ApiProperty({ default: 0 })
  additions!: number;

  @ApiProperty({ default: 0 })
  deletions!: number;

  @ApiProperty({ type: [String], default: [] })
  changedFileNames!: string[];

  @ApiProperty({ default: false })
  hasDescription!: boolean;

  @ApiProperty({ default: 0 })
  reviewCount!: number;

  @ApiProperty({ default: false })
  isDraft!: boolean;

  @ApiProperty({ default: 0 })
  riskScore!: number;

  @ApiProperty({ enum: PullRequestRiskLevel, default: PullRequestRiskLevel.LOW })
  riskLevel!: PullRequestRiskLevel;

  @ApiProperty({ type: [String], default: [] })
  riskReasons!: string[];

  @ApiProperty()
  syncedAt!: string;
}

export class IssueSnapshotDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  repository!: string;

  @ApiProperty()
  githubId!: number;

  @ApiProperty()
  number!: number;

  @ApiProperty()
  title!: string;

  @ApiProperty()
  author!: string;

  @ApiPropertyOptional()
  assignee?: string;

  @ApiProperty()
  state!: string;

  @ApiProperty()
  url!: string;

  @ApiProperty({ type: [String], default: [] })
  labels!: string[];

  @ApiProperty()
  createdAtGithub!: string;

  @ApiProperty()
  updatedAtGithub!: string;

  @ApiPropertyOptional()
  closedAtGithub?: string;

  @ApiProperty({ default: false })
  isStale!: boolean;

  @ApiProperty({ default: false })
  isCritical!: boolean;

  @ApiProperty()
  syncedAt!: string;
}

export class ContributorSnapshotDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  repository!: string;

  @ApiProperty()
  username!: string;

  @ApiPropertyOptional()
  avatarUrl?: string;

  @ApiPropertyOptional()
  profileUrl?: string;

  @ApiProperty({ default: 0 })
  commits!: number;

  @ApiProperty({ default: 0 })
  openPrs!: number;

  @ApiProperty({ default: 0 })
  assignedIssues!: number;

  @ApiProperty({ default: 0 })
  pendingReviews!: number;

  @ApiProperty({ default: 0 })
  staleItems!: number;

  @ApiProperty({ default: 0 })
  workloadScore!: number;

  @ApiProperty({ enum: ContributorWorkloadLevel, default: ContributorWorkloadLevel.BALANCED })
  workloadLevel!: ContributorWorkloadLevel;

  @ApiProperty()
  syncedAt!: string;
}

class PaginatedBaseDto {
  @ApiProperty({ type: Number, example: 1 })
  page!: number;

  @ApiProperty({ type: Number, example: 50 })
  pageSize!: number;

  @ApiProperty({ type: Number, example: 0 })
  total!: number;
}

export class PullRequestSnapshotListDto extends PaginatedBaseDto {
  @ApiProperty({ type: [PullRequestSnapshotDto] })
  items!: PullRequestSnapshotDto[];
}

export class IssueSnapshotListDto extends PaginatedBaseDto {
  @ApiProperty({ type: [IssueSnapshotDto] })
  items!: IssueSnapshotDto[];
}

export class ContributorSnapshotListDto extends PaginatedBaseDto {
  @ApiProperty({ type: [ContributorSnapshotDto] })
  items!: ContributorSnapshotDto[];
}

