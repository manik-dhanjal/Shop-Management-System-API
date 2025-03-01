import { Module } from '@nestjs/common';
import { ProductsModule } from './products/product.module';
import { ShopModule } from './shop/shop.module';
import { InventoryModule } from './inventory/inventory.module';
import { MediaStorageModule } from './media-storage/media-storage.module';
import { UserModule } from './user/user.module';
import { OrderModule } from './orders/order.module';
import { CustomerModule } from './customer/customer.module';

@Module({
  imports: [
    ProductsModule,
    ShopModule,
    InventoryModule,
    MediaStorageModule,
    UserModule,
    OrderModule,
    CustomerModule,
  ],
  providers: [],
})
export class ApiModule {}
