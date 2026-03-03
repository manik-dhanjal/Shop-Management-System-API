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
import { PaginatedResponseDto } from '@shared/dto/pagination-response.dto';
import { PaginatedCustomerQueryDto } from './dto/paginated-customer-query.dto';
import { buildSearchFilter } from '@shared/utils/search-filter.util';

type CustomerSearchFields = {
  name: string;
  phone: string;
  email?: string;
  billingAddress?: {
    address: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
  };
  shippingAddress?: {
    address: string;
    city: string;
    state: string;
    country: string;
    pinCode: string;
  };
};

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
    query: PaginatedCustomerQueryDto,
  ): Promise<PaginatedResponseDto<LeanDocument<CustomerDocument>>> {
    // Set default values for page and limit if not provided
    const skip = (query.page - 1) * query.limit;

    const searchFilter = buildSearchFilter<CustomerSearchFields>({
      search: query.search,
      includedFields: [
        'name',
        'phone',
        'email',
        'billingAddress.address',
        'billingAddress.city',
        'billingAddress.state',
        'billingAddress.country',
        'billingAddress.pinCode',
        'shippingAddress.address',
        'shippingAddress.city',
        'shippingAddress.state',
        'shippingAddress.country',
        'shippingAddress.pinCode',
      ],
    });

    return this.repository.findWithPagination(
      {
        shop: shopId,
        ...query.filter,
        ...searchFilter,
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
