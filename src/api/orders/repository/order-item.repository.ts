import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CoreRepository } from '@core/core.repository';
import { Model } from 'mongoose';
import { OrderItem, OrderItemDocument } from '../schema/order-item.schema';

@Injectable()
export class OrderItemRepository extends CoreRepository<OrderItemDocument> {
  constructor(
    @InjectModel(OrderItem.name)
    readonly model: Model<OrderItemDocument>,
  ) {
    super(model);
  }
}
