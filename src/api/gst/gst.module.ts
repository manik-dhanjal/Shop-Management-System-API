import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { GstAuthClient } from './clients/gst-auth.client';
import { GstReturnClient } from './clients/gst-return.client';
import { GstLedgerClient } from './clients/gst-ledger.client';
import { GstEwayBillClient } from './clients/gst-eway-bill.client';
import { GstFiling, GstFilingSchema } from './schema/gst-filing.schema';
import { GstFilingRepository } from './repository/gst-filing.repository';
import { GstFilingService } from './services/gst-filing.service';
import { AiGstService } from './services/ai-gst.service';
import { GstFilingController } from './gst-filing.controller';
import { OrderModule } from '@api/orders/order.module';
import { ShopModule } from '@api/shop/shop.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: GstFiling.name, schema: GstFilingSchema },
    ]),
    OrderModule,
    ShopModule,
  ],
  controllers: [GstFilingController],
  providers: [
    GstAuthClient,
    GstReturnClient,
    GstLedgerClient,
    GstEwayBillClient,
    GstFilingRepository,
    GstFilingService,
    AiGstService,
  ],
  exports: [
    GstAuthClient,
    GstReturnClient,
    GstLedgerClient,
    GstEwayBillClient,
    GstFilingService,
  ],
})
export class GstModule {}
