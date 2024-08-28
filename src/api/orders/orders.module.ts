import { Module } from '@nestjs/common';
import { OrderItem, OrderItemSchema } from './schema/order-item.schema';
import { MongooseModule } from '@nestjs/mongoose';
import { Order, OrderSchema } from './schema/order.schema';
import { OrdersController } from './orders.controller';
import { OrderRepository } from './repository/order.repository';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Order.name, schema: OrderSchema },
      { name: OrderItem.name, schema: OrderItemSchema },
    ]),
  ],
  controllers: [OrdersController],
  providers: [OrderRepository],
})
export class OrdersModule {}
