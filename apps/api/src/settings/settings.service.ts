import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IntegrationSettingsStatusDto } from './dto/integration-settings-status.dto';

@Injectable()
export class SettingsService {
  constructor(private readonly configService: ConfigService) {}

  getIntegrationStatus(): IntegrationSettingsStatusDto {
    const githubToken = this.configService.get<string>('GITHUB_TOKEN')?.trim();
    const aiEnabled = this.configService.get<string>('AI_ENABLED')?.toLowerCase() === 'true';
    const rawProvider = this.configService.get<string>('AI_PROVIDER')?.toLowerCase();
    const provider = rawProvider === 'ollama' ? 'ollama' : 'none';
    const model = this.configService.get<string>('AI_MODEL')?.trim();
    const aiBaseUrl = this.configService.get<string>('AI_BASE_URL')?.trim();

    return {
      github: {
        tokenConfigured: Boolean(githubToken && githubToken !== 'your_github_token_here'),
        mode: githubToken && githubToken !== 'your_github_token_here'
          ? 'token-authenticated'
          : 'public-api'
      },
      ai: {
        enabled: aiEnabled,
        provider: aiEnabled ? provider : 'none',
        model: aiEnabled && model ? model : undefined,
        baseUrlConfigured: Boolean(aiBaseUrl)
      },
      notifications: {
        enabled: false,
        channels: []
      }
    };
  }
}
