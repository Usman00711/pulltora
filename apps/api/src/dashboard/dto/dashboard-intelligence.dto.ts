import { ApiProperty } from '@nestjs/swagger';
import { HealthLevel } from '../../common/intelligence/health-score';

export class DistributionPointDto {
  @ApiProperty()
  name!: string;

  @ApiProperty()
  value!: number;
}

export class DashboardTotalsDto {
  @ApiProperty()
  repositories!: number;

  @ApiProperty()
  averageHealth!: number;

  @ApiProperty()
  highRiskPrs!: number;

  @ApiProperty()
  criticalPrs!: number;

  @ApiProperty()
  staleIssues!: number;

  @ApiProperty()
  criticalIssues!: number;

  @ApiProperty()
  reviewBottlenecks!: number;

  @ApiProperty()
  hotspotFiles!: number;
}

export class RepositoryHealthRowDto {
  @ApiProperty()
  repositoryId!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty()
  score!: number;

  @ApiProperty({ enum: ['EXCELLENT', 'STABLE', 'WATCH', 'AT_RISK'] })
  level!: HealthLevel;

  @ApiProperty()
  highRiskPrs!: number;

  @ApiProperty()
  criticalIssues!: number;

  @ApiProperty()
  reviewBottlenecks!: number;

  @ApiProperty()
  hotspotFiles!: number;

  @ApiProperty({ nullable: true })
  lastSyncedAt!: string | null;
}

export class DashboardIntelligenceDto {
  @ApiProperty({ type: DashboardTotalsDto })
  totals!: DashboardTotalsDto;

  @ApiProperty({ type: [RepositoryHealthRowDto] })
  repositories!: RepositoryHealthRowDto[];

  @ApiProperty({ type: [DistributionPointDto] })
  prRiskDistribution!: DistributionPointDto[];

  @ApiProperty({ type: [DistributionPointDto] })
  issueDistribution!: DistributionPointDto[];

  @ApiProperty({ type: [DistributionPointDto] })
  workloadDistribution!: DistributionPointDto[];

  @ApiProperty({ type: [DistributionPointDto] })
  hotspotModules!: DistributionPointDto[];

  @ApiProperty({ type: [String] })
  topRisks!: string[];
}

