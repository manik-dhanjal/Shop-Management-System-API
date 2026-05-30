import { MongooseModule } from '@nestjs/mongoose';
import { Shop, ShopSchema } from './schema/shop.schema';
import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ShopController } from './shop.controller';
import { ShopRepository } from './repository/shops.repository';
import { ShopService } from './shop.service';
import { GstVerificationService } from './gst-verification.service';
import { GstReverifyScheduler } from './gst-reverify.scheduler';
import { UserModule } from '@api/user/user.module';
import { User, UserSchema } from '@api/user/schema/user.schema';
import { GstModule } from '@api/gst/gst.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Shop.name, schema: ShopSchema },
      { name: User.name, schema: UserSchema },
    ]),
    ScheduleModule.forRoot(),
    UserModule,
    GstModule,
  ],
  controllers: [ShopController],
  providers: [ShopRepository, ShopService, GstVerificationService, GstReverifyScheduler],
  exports: [ShopService],
})
export class ShopModule {}
