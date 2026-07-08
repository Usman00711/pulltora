import { BadRequestException, Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AuthenticatedUser } from '../auth/interfaces/jwt-payload.interface';
import { DashboardIntelligenceDto } from './dto/dashboard-intelligence.dto';
import { DashboardService } from './dashboard.service';

@ApiTags('Dashboard')
@Controller('dashboard')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('intelligence')
  @ApiOperation({ summary: 'Get dashboard-wide engineering intelligence' })
  @ApiResponse({ status: 200, type: DashboardIntelligenceDto })
  getIntelligence(@CurrentUser() user: AuthenticatedUser) {
    if (!user?.id) {
      throw new BadRequestException('Authenticated user missing');
    }

    return this.dashboardService.getIntelligence(user.id);
  }
}

