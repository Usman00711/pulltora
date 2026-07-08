import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RepositoryDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  owner!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  fullName!: string;

  @ApiProperty()
  url!: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  language?: string;

  @ApiProperty({ default: 0 })
  stars!: number;

  @ApiProperty({ default: 0 })
  forks!: number;

  @ApiPropertyOptional()
  defaultBranch?: string;

  @ApiPropertyOptional({ type: String, nullable: true })
  lastSyncedAt?: string | null;

  @ApiProperty()
  createdAt!: string;

  @ApiProperty()
  updatedAt!: string;
}

export class PaginatedRepositoryResponseDto {
  @ApiProperty({ type: [RepositoryDto] })
  items!: RepositoryDto[];

  @ApiProperty({ example: 1 })
  page!: number;

  @ApiProperty({ example: 50 })
  pageSize!: number;

  @ApiProperty({ example: 10 })
  total!: number;
}
