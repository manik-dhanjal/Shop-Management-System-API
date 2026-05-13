import { Module } from '@nestjs/common';
import { CustomerRepository } from './customer.repository';
import { MongooseModule } from '@nestjs/mongoose';
import { Customer, CustomerSchema } from './schema/customer.schema';
import {
  CustomerCounter,
  CustomerCounterSchema,
} from './schema/customer-counter.schema';
import { CustomerService } from './customer.service';
import { CustomerController } from './customer.controller';
import { CustomerCounterRepository } from './repository/customer-counter.repository';
import { CustomerCodeService } from './customer-code.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Customer.name, schema: CustomerSchema },
      { name: CustomerCounter.name, schema: CustomerCounterSchema },
    ]),
  ],
  providers: [
    CustomerRepository,
    CustomerCounterRepository,
    CustomerCodeService,
    CustomerService,
  ],
  exports: [CustomerService],
  controllers: [CustomerController],
})
export class CustomerModule {}
