import { ApiProperty } from '@nestjs/swagger';
import { IsMongoId, IsNotEmpty, IsString } from 'class-validator';
import { PrepareGstReturnDto } from './prepare-gst-return.dto';

export class FileGstReturnDto extends PrepareGstReturnDto {
  @ApiProperty({
    description: 'GST portal authentication token obtained via OTP validation',
    example: 'eyJhbGciOiJSUzI1NiJ9...',
  })
  @IsString()
  @IsNotEmpty()
  authToken: string;

  @ApiProperty({
    description: 'ID of the prepared GST filing record',
    example: '64f1a2b3c4d5e6f7890g1234',
  })
  @IsMongoId()
  @IsNotEmpty()
  filingId: string;
}
