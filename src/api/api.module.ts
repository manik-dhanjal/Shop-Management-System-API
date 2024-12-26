import { Module } from '@nestjs/common';
import { ProductsModule } from './products/product.module';
import { ShopModule } from './shops/shop.module';
import { SuppliersModule } from './suppliers/suppliers.module';
import { InventoryModule } from './inventory/inventory.module';
import { MediaStorageModule } from './media-storage/media-storage.module';

@Module({
  imports: [
    ProductsModule,
    ShopModule,
    SuppliersModule,
    InventoryModule,
    MediaStorageModule,
  ],
  providers: [],
})
export class ApiModule {}
