import { Module } from '@nestjs/common';
import { ProductsModule } from './products/products.module';
import { ShopsModule } from './shops/shops.module';

@Module({
  imports: [ProductsModule, ShopsModule],
  providers: [],
})
export class ApiModule {}
