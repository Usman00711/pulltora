import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../interfaces/jwt-payload.interface';

export class AuthUserDto {
  @ApiProperty()
  id!: string;

  @ApiProperty()
  name!: string;

  @ApiProperty()
  email!: string;

  @ApiProperty({ enum: UserRole })
  role!: UserRole;

  @ApiProperty({ required: false })
  createdAt?: string | Date;

  @ApiProperty({ required: false })
  updatedAt?: string | Date;
}

export class AuthResponseDto {
  @ApiProperty()
  accessToken!: string;

  @ApiProperty()
  refreshToken!: string;

  @ApiProperty({ type: AuthUserDto })
  user!: AuthUserDto;
}
