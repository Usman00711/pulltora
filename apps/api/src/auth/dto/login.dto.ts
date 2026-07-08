import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'founder@pulltora.io' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '**********' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
