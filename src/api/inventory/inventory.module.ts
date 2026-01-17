import { forwardRef, Module } from '@nestjs/common';
import { InventoryController } from './inventory.controller';
import { InventoryService } from './inventory.service';
import { InventoryRepository } from './repository/inventory.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Inventory, InventorySchema } from './schema/inventory.schema';
import { ProductsModule } from '@api/products/product.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Inventory.name, schema: InventorySchema },
    ]),
    forwardRef(() => ProductsModule),
  ],
  controllers: [InventoryController],
  providers: [InventoryService, InventoryRepository],
  exports: [InventoryService, InventoryRepository],
})
export class InventoryModule {}
