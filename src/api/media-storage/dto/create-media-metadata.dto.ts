import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class CreateMediaMetadata {
  @ApiProperty({
    description: 'It is the small description about the uploaded media',
  })
  @IsString()
  @IsOptional()
  alt?: string;
}
