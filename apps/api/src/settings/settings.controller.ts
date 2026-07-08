import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { IntegrationSettingsStatusDto } from './dto/integration-settings-status.dto';
import { SettingsService } from './settings.service';

@ApiTags('Settings')
@Controller('settings')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) {}

  @Get('integrations')
  @ApiOperation({ summary: 'Get safe integration configuration status' })
  @ApiResponse({ status: 200, type: IntegrationSettingsStatusDto })
  getIntegrations() {
    return this.settingsService.getIntegrationStatus();
  }
}
