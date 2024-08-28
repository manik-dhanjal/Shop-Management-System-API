import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Supplier, SupplierSchema } from './schema/supplier.schema';
import { SuppliersController } from './suppliers.controller';
import { SuppliersRepository } from './repository/suppliers.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Supplier.name, schema: SupplierSchema },
    ]),
  ],
  controllers: [SuppliersController],
  providers: [SuppliersRepository],
})
export class SuppliersModule {}
