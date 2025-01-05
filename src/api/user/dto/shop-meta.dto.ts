import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../enum/user-role.enum';
import { IsArray, IsEnum, IsNotEmpty, IsString } from 'class-validator';

export class ShopMetaDto {
  @ApiProperty({ description: 'ID of shops to which user belongs' })
  @IsNotEmpty()
  @IsString()
  shop: string;

  @ApiProperty({ enum: UserRole, description: 'Role assigned to the user' })
  @IsNotEmpty()
  @IsEnum(UserRole, { message: 'Invalid role', each: true })
  @IsArray()
  roles: UserRole[];
}
