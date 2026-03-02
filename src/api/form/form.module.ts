import { Module } from '@nestjs/common';
import FormController from './form.controller';
import { FormService } from './form.service';
import { OrderModule } from '@api/orders/order.module';
import { ProductsModule } from '@api/products/product.module';
import { CustomerModule } from '@api/customer/customer.module';
import { ShopModule } from '@api/shop/shop.module';

@Module({
  imports: [OrderModule, ProductsModule, CustomerModule, ShopModule],
  controllers: [FormController],
  providers: [FormService],
})
export class FormModule {}
