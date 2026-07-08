import { ApiProperty } from '@nestjs/swagger';

export class RepositorySyncSummaryDto {
  @ApiProperty()
  repositoryId!: string;

  @ApiProperty()
  syncedAt!: string;

  @ApiProperty({ example: 0 })
  pullRequestsSynced!: number;

  @ApiProperty({ example: 0 })
  issuesSynced!: number;

  @ApiProperty({ example: 0 })
  contributorsSynced!: number;

  @ApiProperty({ example: 'Repository synced successfully.' })
  message!: string;
}
