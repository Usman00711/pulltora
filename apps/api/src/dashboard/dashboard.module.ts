import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ActivityLog, ActivityLogSchema } from '../common/schemas/activity-log.schema';
import { ContributorSnapshot, ContributorSnapshotSchema } from '../repositories/schemas/contributor-snapshot.schema';
import { HotspotFile, HotspotFileSchema } from '../repositories/schemas/hotspot-file.schema';
import { IssueSnapshot, IssueSnapshotSchema } from '../repositories/schemas/issue-snapshot.schema';
import { PullRequestSnapshot, PullRequestSnapshotSchema } from '../repositories/schemas/pull-request-snapshot.schema';
import { Repository, RepositorySchema } from '../repositories/repository.schema';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Repository.name, schema: RepositorySchema },
      { name: PullRequestSnapshot.name, schema: PullRequestSnapshotSchema },
      { name: IssueSnapshot.name, schema: IssueSnapshotSchema },
      { name: ContributorSnapshot.name, schema: ContributorSnapshotSchema },
      { name: HotspotFile.name, schema: HotspotFileSchema },
      { name: ActivityLog.name, schema: ActivityLogSchema }
    ])
  ],
  controllers: [DashboardController],
  providers: [DashboardService]
})
export class DashboardModule {}

