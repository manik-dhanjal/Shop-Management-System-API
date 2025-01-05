import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
} from '@nestjs/common';
import { LeanDocument } from '@shared/types/lean-document.interface';
import { ShopDocument } from './schema/shop.schema';
import { CreateShopDto } from './dto/create-shop.dto';
import { ShopService } from './shop.service';
import { UpdateShopDto } from './dto/update-shop.dto';
import { Roles } from '@shared/decorator/roles.decorator';
import { UserRole } from '@api/user/enum/user-role.enum';

@Controller('shop')
export class ShopController {
  constructor(private readonly service: ShopService) {}

  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN, UserRole.MANAGER)
  @Get(':shopId')
  async getShop(
    @Param('shopId') shopId: string,
  ): Promise<LeanDocument<ShopDocument>> {
    return this.service.getShopById(shopId);
  }

  @Post()
  async createShop(
    @Body() newShop: CreateShopDto,
    @Request() req,
  ): Promise<LeanDocument<ShopDocument>> {
    return this.service.createShop(req.user, newShop);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':shopId')
  async updateShop(
    @Param('shopId') shopId: string,
    @Body() updatedShop: UpdateShopDto,
  ): Promise<LeanDocument<ShopDocument>> {
    return this.service.updateShop(shopId, updatedShop);
  }
}
