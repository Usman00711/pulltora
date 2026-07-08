import {
  Body,
  Controller,
  Get,
  Post,
  UseGuards
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiBody,
  ApiOperation,
  ApiOkResponse,
  ApiResponse,
  ApiTags
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { CurrentUser } from './decorators/current-user.decorator';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginDto, RegisterDto, RefreshTokenDto, AuthResponseDto } from './dto';
import { AuthenticatedUser } from './interfaces/jwt-payload.interface';
import { AuthUserDto } from './dto';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({ status: 201, type: AuthResponseDto })
  @Post('register')
  register(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 201, type: AuthResponseDto })
  @ApiBody({ type: LoginDto })
  @Post('login')
  login(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    return this.authService.login(dto);
  }

  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 201, type: AuthResponseDto })
  @Post('refresh')
  refresh(@Body() dto: RefreshTokenDto): Promise<AuthResponseDto> {
    return this.authService.refresh(dto);
  }

  @ApiOperation({ summary: 'Get current authenticated user' })
  @ApiBearerAuth()
  @ApiOkResponse({
    description: 'Current user',
    schema: {
      type: 'object',
      properties: {
        user: { $ref: '#/components/schemas/AuthUserDto' }
      }
    }
  })
  @UseGuards(JwtAuthGuard)
  @Get('me')
  getCurrentUser(
    @CurrentUser() user: AuthenticatedUser
  ): Promise<{ user: AuthUserDto }> {
    return this.authService.me(user.id).then((currentUser) => ({ user: currentUser }));
  }
}
