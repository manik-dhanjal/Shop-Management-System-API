import { Module } from '@nestjs/common';
import { ProductsModule } from './products/product.module';
import { ShopModule } from './shops/shop.module';
import { InventoryModule } from './inventory/inventory.module';
import { MediaStorageModule } from './media-storage/media-storage.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ProductsModule,
    ShopModule,
    InventoryModule,
    MediaStorageModule,
    UserModule,
  ],
  providers: [],
})
export class ApiModule {}
