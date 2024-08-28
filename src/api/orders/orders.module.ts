import { Module } from '@nestjs/common';
import { OrderItem, OrderItemSchema } from './schema/order-item.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schema/order.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: OrderItem.name, schema: OrderItemSchema },
    ]),
  ],
})
export class OrdersModule {}
