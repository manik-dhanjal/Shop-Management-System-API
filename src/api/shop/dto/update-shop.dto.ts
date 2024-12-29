import { PartialType } from '@nestjs/swagger';
import { CreateShopDto } from './create-shop.dto';
import { IsMongoId, IsNotEmpty } from 'class-validator';

export class UpdateShopDto extends PartialType(CreateShopDto) {
  @IsMongoId()
  @IsNotEmpty()
  _id: string;
}
