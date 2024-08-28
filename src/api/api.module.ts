import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { ShopsModule } from './shops/shops.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { InventoryModule } from './inventory/inventory.module';

@Module({
  imports: [ProductsModule, ShopsModule, SuppliersModule, InventoryModule],
  providers: [],
})
export class ApiModule {}
