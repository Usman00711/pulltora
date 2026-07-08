import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, MinLength, MaxLength } from 'class-validator';

export class RegisterDto {
  @ApiProperty({ example: 'Ayaan Malik' })
  @IsString()
  @MinLength(2)
  @MaxLength(100)
  name!: string;

  @ApiProperty({ example: 'founder@pulltora.io' })
  @IsEmail()
  email!: string;

  @ApiProperty({ example: '**********' })
  @IsString()
  @MinLength(8)
  @MaxLength(128)
  password!: string;
}
