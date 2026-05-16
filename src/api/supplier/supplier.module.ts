import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Shop, ShopSchema } from '@api/shop/schema/shop.schema';
import {
  SupplierCounter,
  SupplierCounterSchema,
} from './schema/supplier-counter.schema';
import { SupplierController } from './supplier.controller';
import { SupplierService } from './supplier.service';
import { SupplierRepository } from './supplier.repository';
import { SupplierCodeService } from './supplier-code.service';
import { SupplierCounterRepository } from './repository/supplier-counter.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Shop.name, schema: ShopSchema },
      { name: SupplierCounter.name, schema: SupplierCounterSchema },
    ]),
  ],
  providers: [
    SupplierRepository,
    SupplierCounterRepository,
    SupplierCodeService,
    SupplierService,
  ],
  exports: [SupplierService],
  controllers: [SupplierController],
})
export class SupplierModule {}
