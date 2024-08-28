import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Inventory, InventorySchema } from './schema/inventory.schema';
import { InventoryController } from './inventory.controller';
import { InventoryRepository } from './repository/inventory.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Inventory.name, schema: InventorySchema },
    ]),
  ],
  controllers: [InventoryController],
  providers: [InventoryRepository],
})
export class InventoryModule {}
