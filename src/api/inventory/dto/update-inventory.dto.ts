import { ApiProperty, PartialType } from '@nestjs/swagger';
import { CreateInventoryDto } from './create-inventory.dto';
import { IsMongoId, IsString } from 'class-validator';

export class UpdateInventoryDto extends PartialType(CreateInventoryDto) {
  @ApiProperty({
    description: 'ID of the inventory item',
    example: '64f1a2b3c4d5e6f7890g1234',
    required: false,
  })
  @IsMongoId()
  _id?: string;
}
