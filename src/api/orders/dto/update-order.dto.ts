import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { CreateOrderDto } from './create-order.dto';
import { IsDate, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateOrderDto extends PartialType(
  OmitType(CreateOrderDto, ['createdAt']),
) {
  @ApiProperty({
    description: 'Timestamp of the last update',
    example: '2024-03-01T12:00:00.000Z',
    required: true,
  })
  @IsDate()
  @Type(() => Date)
  updatedAt: Date;
}
