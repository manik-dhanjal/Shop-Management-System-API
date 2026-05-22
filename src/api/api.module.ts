import { Module } from '@nestjs/common';
import { ProductsModule } from './products/product.module';
import { ShopModule } from './shop/shop.module';
import { MediaStorageModule } from './media-storage/media-storage.module';
import { UserModule } from './user/user.module';
import { OrderModule } from './orders/order.module';
import { CustomerModule } from './customer/customer.module';
import { InventoryModule } from './inventory/inventory.module';
import { FormModule } from './form/form.module';
import { SupplierModule } from './supplier/supplier.module';
import { LocationModule } from './location/location.module';

@Module({
  imports: [
    ProductsModule,
    ShopModule,
    MediaStorageModule,
    UserModule,
    OrderModule,
    CustomerModule,
    InventoryModule,
    FormModule,
    SupplierModule,
    LocationModule,
  ],
  providers: [],
})
export class ApiModule {}
