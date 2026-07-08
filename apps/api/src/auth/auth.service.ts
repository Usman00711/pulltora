import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { JwtPayload } from './interfaces/jwt-payload.interface';
import { LoginDto, RefreshTokenDto, RegisterDto } from './dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService
  ) {}

  async register(dto: RegisterDto) {
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create({
      name: dto.name,
      email: dto.email.toLowerCase(),
      passwordHash
    });

    return this.issueTokens(user);
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email.toLowerCase(), true);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordMatch = await bcrypt.compare(dto.password, user.passwordHash);

    if (!isPasswordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    return this.issueTokens(user);
  }

  async me(userId: string) {
    return this.usersService.sanitize(await this.usersService.findById(userId));
  }

  async refresh(dto: RefreshTokenDto) {
    const jwtSecret = this.getJwtSecret();
    const payload = this.jwtService.verify<JwtPayload & { jti?: string }>(
      dto.refreshToken, { secret: jwtSecret }
    );

    const isValidRefreshToken = await this.usersService.verifyRefreshToken(
      payload.sub,
      dto.refreshToken
    );

    if (!isValidRefreshToken) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findById(payload.sub);
    return this.issueTokens(user);
  }

  private issueTokens(user: any) {
    const payload: JwtPayload = {
      sub: user.id || user._id.toString(),
      email: user.email,
      role: user.role
    };

    const accessExpiresIn = this.configService.get('JWT_ACCESS_EXPIRES_IN') || '15m';
    const refreshExpiresIn = this.configService.get('JWT_REFRESH_EXPIRES_IN') || '7d';
    const jwtSecret = this.getJwtSecret();
    const refreshToken = this.jwtService.sign(payload, {
      secret: jwtSecret,
      expiresIn: refreshExpiresIn
    });
    const accessToken = this.jwtService.sign(payload, {
      secret: jwtSecret,
      expiresIn: accessExpiresIn
    });

    void this.usersService.setRefreshToken(user.id || user._id.toString(), refreshToken);

    return {
      accessToken,
      refreshToken,
      user: this.usersService.sanitize(user)
    };
  }

  private getJwtSecret() {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) {
      throw new UnauthorizedException('JWT secret is not configured');
    }

    return secret;
  }
}
