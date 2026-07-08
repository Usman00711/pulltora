import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  HttpCode,
  HttpStatus,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import {
  CreateRepositoryDto,
  UpdateRepositoryDto,
  RepositoryDto,
  PaginatedRepositoryResponseDto,
  RepositorySyncSummaryDto,
  RepositoryAnalysisSummaryDto,
  RepositoryHealthDto,
  RepositoryInsightListDto,
  RepositoryRiskSummaryDto,
  HotspotFileListDto,
  ReviewBottlenecksDto,
  WorkloadSummaryDto,
  PullRequestSnapshotListDto,
  IssueSnapshotListDto,
  ContributorSnapshotListDto
} from './dto';
import { RepositoriesService } from './repositories.service';

@ApiTags('Repositories')
@Controller('repositories')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class RepositoriesController {
  constructor(private readonly repositoriesService: RepositoriesService) {}

  @Post()
  @ApiOperation({ summary: 'Create a repository' })
  @ApiBody({ type: CreateRepositoryDto })
  @ApiResponse({ status: 201, type: RepositoryDto })
  create(
    @CurrentUser() user: AuthenticatedUser,
    @Body() dto: CreateRepositoryDto
  ) {
    if (!user?.id) {
      throw new BadRequestException('Authenticated user missing');
    }

    return this.repositoriesService.create(dto, user.id);
  }

  @Get()
  @ApiOperation({ summary: 'List repositories for current user' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 50 })
  @ApiResponse({ status: 200, type: PaginatedRepositoryResponseDto })
  list(
    @CurrentUser() user: AuthenticatedUser,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ) {
    if (!user?.id) {
      throw new BadRequestException('Authenticated user missing');
    }

    return this.repositoriesService.list(
      user.id,
      page ? Number(page) : undefined,
      pageSize ? Number(pageSize) : undefined
    );
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get repository details' })
  @ApiParam({ name: 'id', example: '684f...' })
  @ApiResponse({ status: 200, type: RepositoryDto })
  getById(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string
  ) {
    if (!user?.id) {
      throw new BadRequestException('Authenticated user missing');
    }

    return this.repositoriesService.getById(id, user.id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update repository' })
  @ApiParam({ name: 'id', example: '684f...' })
  @ApiBody({ type: UpdateRepositoryDto })
  @ApiResponse({ status: 200, type: RepositoryDto })
  update(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Body() dto: UpdateRepositoryDto
  ) {
    if (!user?.id) {
      throw new BadRequestException('Authenticated user missing');
    }

    return this.repositoriesService.update(id, user.id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete repository' })
  @ApiParam({ name: 'id', example: '684f...' })
  @ApiResponse({ status: 204, description: 'Repository deleted' })
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string
  ) {
    if (!user?.id) {
      throw new BadRequestException('Authenticated user missing');
    }

    return this.repositoriesService.delete(id, user.id);
  }

  @Post(':id/sync')
  @ApiOperation({ summary: 'Sync repository from GitHub and refresh snapshots' })
  @ApiParam({ name: 'id', example: '684f...' })
  @ApiResponse({ status: 200, type: RepositorySyncSummaryDto })
  sync(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string
  ) {
    if (!user?.id) {
      throw new BadRequestException('Authenticated user missing');
    }

    return this.repositoriesService.syncRepositoryById(id, user.id);
  }

  @Post(':id/analyze')
  @ApiOperation({ summary: 'Analyze synced repository snapshots' })
  @ApiParam({ name: 'id', example: '684f...' })
  @ApiResponse({ status: 200, type: RepositoryAnalysisSummaryDto })
  analyze(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string
  ) {
    if (!user?.id) {
      throw new BadRequestException('Authenticated user missing');
    }

    return this.repositoriesService.analyzeRepositoryById(id, user.id);
  }

  @Post(':id/insights/generate')
  @ApiOperation({ summary: 'Generate repository improvement ideas from analyzed intelligence' })
  @ApiParam({ name: 'id', example: '684f...' })
  @ApiResponse({ status: 200, type: RepositoryInsightListDto })
  generateInsights(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string
  ) {
    if (!user?.id) {
      throw new BadRequestException('Authenticated user missing');
    }

    return this.repositoriesService.generateRepositoryInsights(id, user.id);
  }

  @Get(':id/insights')
  @ApiOperation({ summary: 'List repository improvement ideas' })
  @ApiParam({ name: 'id', example: '684f...' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 50 })
  @ApiResponse({ status: 200, type: RepositoryInsightListDto })
  listInsights(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ) {
    if (!user?.id) {
      throw new BadRequestException('Authenticated user missing');
    }

    return this.repositoriesService.listRepositoryInsights(
      id,
      user.id,
      page ? Number(page) : undefined,
      pageSize ? Number(pageSize) : undefined
    );
  }

  @Get(':id/risks')
  @ApiOperation({ summary: 'Get repository intelligence risk summary' })
  @ApiParam({ name: 'id', example: '684f...' })
  @ApiResponse({ status: 200, type: RepositoryRiskSummaryDto })
  getRisks(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string
  ) {
    if (!user?.id) {
      throw new BadRequestException('Authenticated user missing');
    }

    return this.repositoriesService.getRiskSummary(id, user.id);
  }

  @Get(':id/health')
  @ApiOperation({ summary: 'Get repository health score' })
  @ApiParam({ name: 'id', example: '684f...' })
  @ApiResponse({ status: 200, type: RepositoryHealthDto })
  getHealth(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string
  ) {
    if (!user?.id) {
      throw new BadRequestException('Authenticated user missing');
    }

    return this.repositoriesService.getRepositoryHealth(id, user.id);
  }

  @Get(':id/pull-requests')
  @ApiOperation({ summary: 'List pulled request snapshots for repository' })
  @ApiParam({ name: 'id', example: '684f...' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 50 })
  @ApiResponse({ status: 200, type: PullRequestSnapshotListDto })
  listPullRequests(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ) {
    if (!user?.id) {
      throw new BadRequestException('Authenticated user missing');
    }

    return this.repositoriesService.listPullRequestSnapshots(
      id,
      user.id,
      page ? Number(page) : undefined,
      pageSize ? Number(pageSize) : undefined
    );
  }

  @Get(':id/issues')
  @ApiOperation({ summary: 'List issue snapshots for repository' })
  @ApiParam({ name: 'id', example: '684f...' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 50 })
  @ApiResponse({ status: 200, type: IssueSnapshotListDto })
  listIssues(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ) {
    if (!user?.id) {
      throw new BadRequestException('Authenticated user missing');
    }

    return this.repositoriesService.listIssueSnapshots(
      id,
      user.id,
      page ? Number(page) : undefined,
      pageSize ? Number(pageSize) : undefined
    );
  }

  @Get(':id/contributors')
  @ApiOperation({ summary: 'List contributor snapshots for repository' })
  @ApiParam({ name: 'id', example: '684f...' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 50 })
  @ApiResponse({ status: 200, type: ContributorSnapshotListDto })
  listContributors(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ) {
    if (!user?.id) {
      throw new BadRequestException('Authenticated user missing');
    }

    return this.repositoriesService.listContributorSnapshots(
      id,
      user.id,
      page ? Number(page) : undefined,
      pageSize ? Number(pageSize) : undefined
    );
  }

  @Get(':id/hotspots')
  @ApiOperation({ summary: 'List repository hotspot files' })
  @ApiParam({ name: 'id', example: '684f...' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, example: 50 })
  @ApiResponse({ status: 200, type: HotspotFileListDto })
  listHotspots(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('pageSize') pageSize?: string
  ) {
    if (!user?.id) {
      throw new BadRequestException('Authenticated user missing');
    }

    return this.repositoriesService.listHotspots(
      id,
      user.id,
      page ? Number(page) : undefined,
      pageSize ? Number(pageSize) : undefined
    );
  }

  @Get(':id/review-bottlenecks')
  @ApiOperation({ summary: 'Get review bottleneck summary' })
  @ApiParam({ name: 'id', example: '684f...' })
  @ApiResponse({ status: 200, type: ReviewBottlenecksDto })
  getReviewBottlenecks(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string
  ) {
    if (!user?.id) {
      throw new BadRequestException('Authenticated user missing');
    }

    return this.repositoriesService.getReviewBottlenecks(id, user.id);
  }

  @Get(':id/workload-summary')
  @ApiOperation({ summary: 'Get contributor workload summary' })
  @ApiParam({ name: 'id', example: '684f...' })
  @ApiResponse({ status: 200, type: WorkloadSummaryDto })
  getWorkloadSummary(
    @CurrentUser() user: AuthenticatedUser,
    @Param('id') id: string
  ) {
    if (!user?.id) {
      throw new BadRequestException('Authenticated user missing');
    }

    return this.repositoriesService.getWorkloadSummary(id, user.id);
  }
}
