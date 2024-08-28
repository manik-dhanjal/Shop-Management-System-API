import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CoreRepository } from '@core/core.repository';
import { Model } from 'mongoose';
import { Order, OrderDocument } from '../schema/order.schema';

@Injectable()
export class OrderRepository extends CoreRepository<OrderDocument> {
  constructor(
    @InjectModel(Order.name)
    readonly model: Model<OrderDocument>,
  ) {
    super(model);
  }
}
