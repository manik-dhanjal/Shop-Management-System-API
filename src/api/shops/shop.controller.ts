import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { LeanDocument } from '@shared/types/lean-document.interface';
import { ShopDocument } from './schema/shop.schema';
import { CreateShopDto } from './dto/create-shop.dto';
import { ShopService } from './shop.service';
import { UpdateShopDto } from './dto/update-shop.dto';

@Controller('api/shop')
export class ShopController {
  constructor(private readonly service: ShopService) {}

  @Get()
  async getShops(): Promise<LeanDocument<ShopDocument>[]> {
    return this.service.getShops();
  }

  @Get(':id')
  async getShop(@Param('id') id: string): Promise<LeanDocument<ShopDocument>> {
    return this.service.getShopById(id);
  }

  @Post()
  async createShop(
    @Body() newShop: CreateShopDto,
  ): Promise<LeanDocument<ShopDocument>> {
    return this.service.createShop(newShop);
  }

  @Patch()
  async updateShop(
    @Body() updatedShop: UpdateShopDto,
  ): Promise<LeanDocument<ShopDocument>> {
    return this.service.updateShop(updatedShop);
  }
}
