import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Shop, ShopDocument } from './schema/shop.schema';
import { GstVerificationService } from './gst-verification.service';

@Injectable()
export class GstReverifyScheduler {
  private readonly logger = new Logger(GstReverifyScheduler.name);

  constructor(
    @InjectModel(Shop.name) private readonly shopModel: Model<ShopDocument>,
    private readonly gstVerificationService: GstVerificationService,
  ) {}

  @Cron('0 3 1 * *')
  async reverifyAll(): Promise<void> {
    this.logger.log('Monthly GST re-verification started');

    const shops = await this.shopModel
      .find({ 'gstDetails.gstin': { $exists: true, $ne: null } })
      .select('_id')
      .lean()
      .exec();

    let succeeded = 0;
    let skipped = 0;

    for (const shop of shops) {
      const result = await this.gstVerificationService
        .reVerify(shop._id.toString())
        .catch((err) => {
          this.logger.warn(`Re-verify error for ${shop._id}: ${err.message}`);
          return null;
        });

      if (result) {
        succeeded++;
      } else {
        skipped++;
      }

      // Respect Whitebooks rate limits
      await sleep(2000);
    }

    this.logger.log(
      `Monthly re-verification complete — verified: ${succeeded}, skipped/failed: ${skipped}`,
    );
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
