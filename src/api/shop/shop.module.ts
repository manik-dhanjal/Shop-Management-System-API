import { MongooseModule } from '@nestjs/mongoose';
import { Shop, ShopSchema } from './schema/shop.schema';
import { Module } from '@nestjs/common';
import { ShopController } from './shop.controller';
import { ShopRepository } from './repository/shops.repository';
import { ShopService } from './shop.service';
import { UserModule } from '@api/user/user.module';
import { User, UserSchema } from '@api/user/schema/user.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Shop.name, schema: ShopSchema },
      { name: User.name, schema: UserSchema },
    ]),
    UserModule,
  ],
  controllers: [ShopController],
  providers: [ShopRepository, ShopService],
  exports: [ShopService],
})
export class ShopModule {}
