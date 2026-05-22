import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StateDto {
  @ApiProperty()
  _id: string;

  @ApiProperty({ example: 'IN' })
  countryCode: string;

  @ApiProperty({ example: '27' })
  code: string;

  @ApiProperty({ example: 'Maharashtra' })
  name: string;

  @ApiProperty({ example: 'State' })
  type: string;

  @ApiProperty()
  isUnionTerritory: boolean;

  @ApiPropertyOptional({ enum: ['NORTH', 'SOUTH', 'EAST', 'WEST', 'NE', 'CENTRAL'] })
  gstZone?: string;

  @ApiPropertyOptional()
  eWayBillIntraThreshold?: number;

  @ApiProperty()
  compositionAllowed: boolean;
}
