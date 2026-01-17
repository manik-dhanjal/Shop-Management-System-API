import { Body, Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { CreateInventoryDto } from './dto/create-inventory.dto';
import { update } from 'lodash';
import { UpdateInventoryDto } from './dto/update-inventory.dto';
import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';
import { PaginatedInventoryQueryDto } from './dto/paginated-inventory-query.dto';

@Controller({
  path: '/shop/:shopId/inventory',
  version: '1',
})
export class InventoryController {
  constructor(private readonly inventoryService: InventoryService) {}

  @Post('paginated')
  async getInventory(
    @Body() query: PaginatedInventoryQueryDto,
    @Param('shopId') shopId: string,
  ) {
    return this.inventoryService.getInventory(shopId, query);
  }

  @Post()
  async addInventory(
    @Body() createInventoryDto: CreateInventoryDto,
    @Param('shopId') shopId: string,
  ) {
    return this.inventoryService.addInventory(shopId, createInventoryDto);
  }

  @Patch(':inventoryId')
  async updateInventory(
    @Body() updateInventoryDto: UpdateInventoryDto,
    @Param('inventoryId') inventoryId: string,
    @Param('shopId') shopId: string,
  ) {
    return this.inventoryService.updateInventory(
      shopId,
      inventoryId,
      updateInventoryDto,
    );
  }

  @Delete(':inventoryId')
  async deleteInventory(
    @Param('inventoryId') inventoryId: string,
    @Param('shopId') shopId: string,
  ) {
    return this.inventoryService.deleteInventory(shopId, inventoryId);
  }
}
