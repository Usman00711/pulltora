import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { RepositoriesModule } from './repositories/repositories.module';
import { GithubModule } from './github/github.module';
import { PullRequestsModule } from './pull-requests/pull-requests.module';
import { IssuesModule } from './issues/issues.module';
import { WorkloadModule } from './workload/workload.module';
import { HotspotsModule } from './hotspots/hotspots.module';
import { ReleaseReadinessModule } from './release-readiness/release-readiness.module';
import { TechnicalDebtModule } from './technical-debt/technical-debt.module';
import { WeeklyDigestModule } from './weekly-digest/weekly-digest.module';
import { CommonModule } from './common/common.module';
import { ConfigModule as AppConfigModule } from './config/config.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    AppConfigModule,
    DatabaseModule,
    AuthModule,
    UsersModule,
    RepositoriesModule,
    GithubModule,
    PullRequestsModule,
    IssuesModule,
    WorkloadModule,
    HotspotsModule,
    ReleaseReadinessModule,
    TechnicalDebtModule,
    WeeklyDigestModule,
    CommonModule
  ]
})
export class AppModule {}
