import { Module } from '@nestjs/common';
import { GstAuthClient } from './clients/gst-auth.client';
import { GstReturnClient } from './clients/gst-return.client';
import { GstLedgerClient } from './clients/gst-ledger.client';
import { GstEwayBillClient } from './clients/gst-eway-bill.client';

@Module({
  providers: [
    GstAuthClient,
    GstReturnClient,
    GstLedgerClient,
    GstEwayBillClient,
  ],
  exports: [GstAuthClient, GstReturnClient, GstLedgerClient, GstEwayBillClient],
})
export class GstModule {}
