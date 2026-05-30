import { Module } from '@nestjs/common';
import { GstAuthClient } from './clients/gst-auth.client';
import { GstReturnClient } from './clients/gst-return.client';
import { GstLedgerClient } from './clients/gst-ledger.client';
import { GstEwayBillClient } from './clients/gst-eway-bill.client';
import { GSTPublicClient } from './clients/gst-public.client';

@Module({
  providers: [
    GstAuthClient,
    GstReturnClient,
    GstLedgerClient,
    GstEwayBillClient,
    GSTPublicClient,
  ],
  exports: [
    GstAuthClient,
    GstReturnClient,
    GstLedgerClient,
    GstEwayBillClient,
    GSTPublicClient,
  ],
})
export class GstModule {}
