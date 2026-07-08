import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class GithubIntegrationStatusDto {
  @ApiProperty()
  tokenConfigured!: boolean;

  @ApiProperty({ enum: ['public-api', 'token-authenticated'] })
  mode!: 'public-api' | 'token-authenticated';
}

export class AiIntegrationStatusDto {
  @ApiProperty()
  enabled!: boolean;

  @ApiProperty({ enum: ['none', 'ollama'] })
  provider!: 'none' | 'ollama';

  @ApiPropertyOptional()
  model?: string;

  @ApiProperty()
  baseUrlConfigured!: boolean;
}

export class NotificationIntegrationStatusDto {
  @ApiProperty()
  enabled!: false;

  @ApiProperty({ type: [String] })
  channels!: string[];
}

export class IntegrationSettingsStatusDto {
  @ApiProperty({ type: GithubIntegrationStatusDto })
  github!: GithubIntegrationStatusDto;

  @ApiProperty({ type: AiIntegrationStatusDto })
  ai!: AiIntegrationStatusDto;

  @ApiProperty({ type: NotificationIntegrationStatusDto })
  notifications!: NotificationIntegrationStatusDto;
}
