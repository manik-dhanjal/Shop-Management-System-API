import { MongooseModule } from '@nestjs/mongoose';
import { Shop, ShopSchema } from './schema/shop.schema';
import { Module } from '@nestjs/common';
import { ShopsController } from './shops.controller';
import { ShopsRepository } from './repository/shops.repository';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Shop.name, schema: ShopSchema }]),
  ],
  controllers: [ShopsController],
  providers: [ShopsRepository],
})
export class ShopsModule {}
