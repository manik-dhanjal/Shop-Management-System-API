import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schema/order.schema';
import {
  InvoiceCounter,
  InvoiceCounterSchema,
} from './schema/invoice-counter.schema';
import { OrderController } from './order.controller';
import { OrderRepository } from './repository/order.repository';
import { OrderService } from './order.service';
import { InvoiceCounterRepository } from './repository/invoice-counter.repository';
import { InvoiceNumberService } from './invoice-number.service';
import { ProductsModule } from '@api/products/product.module';
import { CustomerModule } from '@api/customer/customer.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: InvoiceCounter.name, schema: InvoiceCounterSchema },
    ]),
    ProductsModule,
    CustomerModule,
  ],
  controllers: [OrderController],
  providers: [
    OrderRepository,
    OrderService,
    InvoiceCounterRepository,
    InvoiceNumberService,
  ],
  exports: [OrderService],
})
export class OrderModule {}
