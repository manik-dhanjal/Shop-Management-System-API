import { Module } from '@nestjs/common';
import { ProductsModule } from './products/product.module';
import { ShopModule } from './shops/shop.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [ProductsModule, ShopModule, SuppliersModule, InventoryModule],
  providers: [],
})
export class ApiModule {}
