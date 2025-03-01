import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CoreRepository } from '@core/core.repository';
import { Model } from 'mongoose';
import { Customer, CustomerDocument } from './schema/customer.schema';

@Injectable()
export class CustomerRepository extends CoreRepository<CustomerDocument> {
  constructor(
    @InjectModel(Customer.name)
    readonly model: Model<CustomerDocument>,
  ) {
    super(model);
  }
}
