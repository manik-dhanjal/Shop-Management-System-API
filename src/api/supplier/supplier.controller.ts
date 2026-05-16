import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { SupplierService } from './supplier.service';
import { CreateSupplierDto } from './dto/create-supplier.dto';
import { UpdateSupplierDto } from './dto/update-supplier.dto';
import { UpdateSupplierShopDto } from './dto/update-supplier-shop.dto';
import { PaginatedSupplierQueryDto } from './dto/paginated-supplier-query.dto';
import { CurrentUser } from '@shared/decorator/current-user.decorator';
import { UserDocument } from '@api/user/schema/user.schema';

@Controller({
  path: '/shop/:shopId/supplier',
  version: '1',
})
export class SupplierController {
  constructor(private readonly service: SupplierService) {}

  // ---- Create / link ----
  @Post()
  async createSupplier(
    @Param('shopId') shopId: string,
    @Body() dto: CreateSupplierDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.service.createSupplier(shopId, dto, user);
  }

  // ---- Read ----
  @Get('code/next')
  async previewSupplierCode(@Param('shopId') shopId: string) {
    const supplierCode = await this.service.peekNextSupplierCode(shopId);
    return { supplierCode };
  }

  @Get('stats')
  async getStats(@Param('shopId') shopId: string) {
    return this.service.getShopSupplierStats(shopId);
  }

  @Get('lookup/shops')
  async lookupShops(
    @Param('shopId') shopId: string,
    @Query('q') q?: string,
    @Query('state') state?: string,
    @Query('city') city?: string,
    @Query('kind') kind?: string,
    @Query('gstStatus') gstStatus?: 'any' | 'registered' | 'unregistered',
    @Query('sort') sort?: 'popular' | 'name' | 'recent' | 'nearest',
    @Query('cursor') cursor?: string,
    @Query('limit') limit?: string,
  ) {
    const n = limit ? parseInt(limit, 10) : 20;
    return this.service.lookupShops(shopId, {
      q,
      state,
      city,
      kind,
      gstStatus,
      sort,
      cursor,
      limit: n,
    });
  }

  @Get('suggestions')
  async getSuggestions(@Param('shopId') shopId: string) {
    return this.service.getSuggestions(shopId);
  }

  @Get('shop/:targetShopId/preview')
  async getShopPreview(
    @Param('shopId') shopId: string,
    @Param('targetShopId') targetShopId: string,
  ) {
    return this.service.getShopPreview(shopId, targetShopId);
  }

  @Get(':supplierId')
  async getSupplierById(
    @Param('shopId') shopId: string,
    @Param('supplierId') supplierId: string,
  ) {
    return this.service.getSupplierById(shopId, supplierId);
  }

  @Post('paginated')
  async getPaginated(
    @Param('shopId') shopId: string,
    @Body() query: PaginatedSupplierQueryDto,
  ) {
    return this.service.getPaginatedSuppliers(shopId, query);
  }

  // ---- Update ----
  @Patch(':supplierId')
  async updateSupplier(
    @Param('shopId') shopId: string,
    @Param('supplierId') supplierId: string,
    @Body() dto: UpdateSupplierDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.service.updateSupplier(shopId, supplierId, dto, user);
  }

  @Patch(':supplierId/shop')
  async updateSupplierShop(
    @Param('shopId') shopId: string,
    @Param('supplierId') supplierId: string,
    @Body() dto: UpdateSupplierShopDto,
  ) {
    return this.service.updateSupplierShop(shopId, supplierId, dto);
  }

  // ---- Delete / unlink ----
  @Delete(':supplierId')
  async deleteSupplier(
    @Param('shopId') shopId: string,
    @Param('supplierId') supplierId: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.service.deleteSupplier(shopId, supplierId, user);
  }
}
