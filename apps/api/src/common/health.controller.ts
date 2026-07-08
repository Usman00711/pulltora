import { Controller, Get } from '@nestjs/common';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

class HealthResponseDto {
  status!: string;
  service!: string;
  timestamp!: string;
}

@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiResponse({ status: 200, type: HealthResponseDto })
  getHealth(): HealthResponseDto {
    return {
      status: 'ok',
      service: 'pulltora-api',
      timestamp: new Date().toISOString()
    };
  }
}
