import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserRole } from '../enum/user-role.enum';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'First name of the user' })
  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  firstName: string;

  @ApiProperty({ description: 'Last name of the user' })
  @IsNotEmpty()
  @IsString()
  @Length(2, 50)
  lastName: string;

  @ApiProperty({ description: 'Email address of the user' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ description: 'Phone number of the user' })
  @IsOptional()
  @Matches(/^[0-9]{10}$/, {
    message: 'Phone number must be a 10-digit numeric value',
  })
  phone?: number;

  @ApiPropertyOptional({ description: 'Profile image ID of the user' })
  @IsOptional()
  @IsString()
  profileImage?: string;

  @ApiProperty({ description: 'Password for the user account' })
  @IsNotEmpty()
  @Length(8, 20)
  password: string;

  @ApiProperty({ enum: UserRole, description: 'Role assigned to the user' })
  @IsNotEmpty()
  @IsEnum(UserRole, { message: 'Invalid role' })
  role: UserRole;
}
