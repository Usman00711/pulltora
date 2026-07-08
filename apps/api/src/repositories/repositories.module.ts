import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GithubModule } from '../github/github.module';
import { ActivityLog, ActivityLogSchema } from '../common/schemas/activity-log.schema';
import { ContributorSnapshot, ContributorSnapshotSchema } from './schemas/contributor-snapshot.schema';
import { HotspotFile, HotspotFileSchema } from './schemas/hotspot-file.schema';
import { IssueSnapshot, IssueSnapshotSchema } from './schemas/issue-snapshot.schema';
import {
  PullRequestSnapshot,
  PullRequestSnapshotSchema
} from './schemas/pull-request-snapshot.schema';
import { Repository, RepositorySchema } from './repository.schema';
import { RepositoriesController } from './repositories.controller';
import { RepositoriesService } from './repositories.service';

@Module({
  imports: [
    GithubModule,
    MongooseModule.forFeature([
      { name: Repository.name, schema: RepositorySchema },
      { name: PullRequestSnapshot.name, schema: PullRequestSnapshotSchema },
      { name: IssueSnapshot.name, schema: IssueSnapshotSchema },
      { name: ContributorSnapshot.name, schema: ContributorSnapshotSchema },
      { name: HotspotFile.name, schema: HotspotFileSchema },
      { name: ActivityLog.name, schema: ActivityLogSchema }
    ])
  ],
  controllers: [RepositoriesController],
  providers: [RepositoriesService]
})
export class RepositoriesModule {}
