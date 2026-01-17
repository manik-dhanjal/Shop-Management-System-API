import { forwardRef, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schema/product.schema';
import { ProductsController } from './product.controller';
import { ProductRepository } from './repository/product.repository';
import { ProductService } from './product.service';
import { InventoryModule } from '@api/inventory/inventory.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Product.name, schema: ProductSchema }]),
    forwardRef(() => InventoryModule),
  ],
  controllers: [ProductsController],
  providers: [ProductRepository, ProductService],
  exports: [ProductService, ProductRepository],
})
export class ProductsModule {}
