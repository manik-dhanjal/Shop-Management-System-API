import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CoreRepository } from '@core/core.repository';
import { Model } from 'mongoose';
import { Supplier, SupplierDocument } from '../schema/supplier.schema';

@Injectable()
export class SuppliersRepository extends CoreRepository<SupplierDocument> {
  constructor(
    @InjectModel(Supplier.name)
    readonly model: Model<SupplierDocument>,
  ) {
    super(model);
  }
}
