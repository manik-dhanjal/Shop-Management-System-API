import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { CustomerRepository } from './customer.repository';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { LeanDocument } from '@shared/types/lean-document.interface';
import { CustomerDocument } from './schema/customer.schema';
import { isObjectIdOrHexString, Types } from 'mongoose';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';
import { PaginatedResponseDto } from '@shared/dto/pagination-response.dto';

@Injectable()
export class CustomerService {
  constructor(private readonly repository: CustomerRepository) {}

  async createCustomer(
    shopId: string,
    customer: CreateCustomerDto,
  ): Promise<LeanDocument<CustomerDocument>> {
    if (customer.shop != shopId) throw new UnauthorizedException();

    const existingCustomer = await this.repository.findOne(
      {
        phone: customer.phone,
        shop: shopId,
      },
      {},
      {},
      [],
      true,
    );
    if (existingCustomer) {
      throw new ConflictException(
        `Customer with phone number ${customer.phone} already exists.`,
      );
    }
    return this.repository.create(customer);
  }

  async getCustomerById(
    shopId: string,
    customerId: string,
  ): Promise<LeanDocument<CustomerDocument> | null> {
    return this.repository.findOne(
      {
        _id: customerId,
        shop: shopId,
      },
      {},
      {},
      ['profileImage'],
      true,
    );
  }

  async updateCustomer(
    shopId: string,
    customerId: string,
    customerToUpdate: UpdateCustomerDto,
  ): Promise<LeanDocument<CustomerDocument>> {
    if (!isObjectIdOrHexString(customerId)) {
      throw new UnauthorizedException('Invalid customerId');
    }
    const mongoCustomerId = new Types.ObjectId(customerId);
    await this.repository.findOne({
      _id: mongoCustomerId,
      shop: shopId,
    });
    return this.repository.updateOne(mongoCustomerId, {
      ...customerToUpdate,
      profileImage: customerToUpdate.profileImage || null,
    });
  }

  async getPaginatedCustomer(
    shopId: string,
    query: PaginationQueryDto<CreateCustomerDto>,
  ): Promise<PaginatedResponseDto<LeanDocument<CustomerDocument>>> {
    // Set default values for page and limit if not provided
    const skip = (query.page - 1) * query.limit;
    return this.repository.findWithPagination(
      {
        shop: shopId,
        ...query.filter,
      },
      undefined,
      query.sort,
      skip,
      query.limit,
      ['profileImage'],
    );
  }

  async deleteCustomer(shopId: string, customerId: string): Promise<void> {
    if (!isObjectIdOrHexString(customerId) || !isObjectIdOrHexString(shopId)) {
      throw new UnauthorizedException('Invalid customerId');
    }
    const mongoCustomerId = new Types.ObjectId(customerId);
    await this.repository.findOne({
      _id: mongoCustomerId,
      shop: shopId,
    });
    await this.repository.deleteOne(mongoCustomerId);
  }
}
