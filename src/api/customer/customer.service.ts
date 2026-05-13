import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
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
import { CustomerCodeService } from './customer-code.service';
import { UserDocument } from '@api/user/schema/user.schema';

type CustomerSearchFields = {
  name: string;
  legalName?: string;
  customerCode?: string;
  phone: string;
  email?: string;
  gstin?: string;
  billingAddress?: {
    address: string;
    city: string;
    state: string;
    pinCode: string;
  };
};

@Injectable()
export class CustomerService {
  constructor(
    private readonly repository: CustomerRepository,
    private readonly codeService: CustomerCodeService,
  ) {}

  // ---------------------------------------------------------------------------
  // Create / Upsert
  // ---------------------------------------------------------------------------

  async createCustomer(
    shopId: string,
    customer: CreateCustomerDto,
    user?: UserDocument,
  ): Promise<LeanDocument<CustomerDocument>> {
    const existingCustomer = await this.repository.findOne(
      { phone: customer.phone, shop: shopId, isDeleted: { $ne: true } },
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

    const enriched = this.enrichDerivedFields(customer);
    const customerCode =
      enriched.customerCode || (await this.codeService.generate(shopId));

    return this.repository.create({
      ...enriched,
      customerCode,
      shop: shopId,
      createdBy: user?._id,
      updatedBy: user?._id,
    });
  }

  async upsertCustomerByPhone(
    shopId: string,
    customer: CreateCustomerDto,
    user?: UserDocument,
  ): Promise<LeanDocument<CustomerDocument>> {
    const existingCustomer = await this.repository.findOne(
      { phone: customer.phone, shop: shopId, isDeleted: { $ne: true } },
      {},
      {},
      [],
      true,
    );

    if (!existingCustomer) {
      return this.createCustomer(shopId, customer, user);
    }

    const enriched = this.enrichDerivedFields(customer);
    return this.repository.updateOne(new Types.ObjectId(existingCustomer._id), {
      ...enriched,
      shop: shopId,
      updatedBy: user?._id,
      profileImage:
        enriched.profileImage || existingCustomer.profileImage || null,
      billingAddress:
        enriched.billingAddress || existingCustomer.billingAddress || null,
      shippingAddress:
        enriched.shippingAddress || existingCustomer.shippingAddress || null,
      email: enriched.email || existingCustomer.email || null,
      gstin: enriched.gstin || existingCustomer.gstin || null,
    });
  }

  // ---------------------------------------------------------------------------
  // Read
  // ---------------------------------------------------------------------------

  async getCustomerById(
    shopId: string,
    customerId: string,
  ): Promise<LeanDocument<CustomerDocument> | null> {
    return this.repository.findOne(
      { _id: customerId, shop: shopId, isDeleted: { $ne: true } },
      {},
      {},
      ['profileImage'],
      true,
    );
  }

  async peekNextCustomerCode(shopId: string): Promise<string> {
    return this.codeService.peek(shopId);
  }

  async getPaginatedCustomer(
    shopId: string,
    query: PaginatedCustomerQueryDto,
  ): Promise<PaginatedResponseDto<LeanDocument<CustomerDocument>>> {
    const skip = (query.page - 1) * query.limit;

    const searchFilter = buildSearchFilter<CustomerSearchFields>({
      search: query.search,
      includedFields: [
        'name',
        'legalName',
        'customerCode',
        'phone',
        'email',
        'gstin',
        'billingAddress.address',
        'billingAddress.city',
        'billingAddress.state',
        'billingAddress.pinCode',
      ],
    });

    const baseFilter: Record<string, unknown> = { shop: shopId };
    if (!query.includeDeleted) {
      baseFilter.isDeleted = { $ne: true };
    }

    return this.repository.findWithPagination(
      {
        ...baseFilter,
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

  // ---------------------------------------------------------------------------
  // Update
  // ---------------------------------------------------------------------------

  async updateCustomer(
    shopId: string,
    customerId: string,
    customerToUpdate: UpdateCustomerDto,
    user?: UserDocument,
  ): Promise<LeanDocument<CustomerDocument>> {
    if (!isObjectIdOrHexString(customerId)) {
      throw new UnauthorizedException('Invalid customerId');
    }
    const mongoCustomerId = new Types.ObjectId(customerId);
    const existing = await this.repository.findOne(
      { _id: mongoCustomerId, shop: shopId, isDeleted: { $ne: true } },
      {},
      {},
      [],
      true,
    );
    if (!existing) {
      throw new NotFoundException('Customer not found');
    }
    const enriched = this.enrichDerivedFields(customerToUpdate);
    return this.repository.updateOne(mongoCustomerId, {
      ...enriched,
      updatedBy: user?._id,
    });
  }

  // ---------------------------------------------------------------------------
  // Delete (soft / hard)
  // ---------------------------------------------------------------------------

  /**
   * Soft-deletes by default; preserves invoice history. Hard-deletes only when
   * the customer has never been billed and has zero outstanding balance.
   */
  async deleteCustomer(
    shopId: string,
    customerId: string,
    user?: UserDocument,
  ): Promise<void> {
    if (!isObjectIdOrHexString(customerId) || !isObjectIdOrHexString(shopId)) {
      throw new UnauthorizedException('Invalid customerId');
    }
    const mongoCustomerId = new Types.ObjectId(customerId);
    const existing = await this.repository.findOne(
      { _id: mongoCustomerId, shop: shopId },
      {},
      {},
      [],
      true,
    );
    if (!existing) {
      throw new NotFoundException('Customer not found');
    }

    const stats = (existing.stats ?? {}) as any;
    const canHardDelete =
      (stats.totalOrders ?? 0) === 0 && (stats.outstandingBalance ?? 0) === 0;

    if (canHardDelete) {
      await this.repository.deleteOne(mongoCustomerId);
      return;
    }

    await this.repository.updateOne(mongoCustomerId, {
      isDeleted: true,
      deletedAt: new Date(),
      deletedBy: user?._id,
    });
  }

  // ---------------------------------------------------------------------------
  // Stats hook — called from OrderService after a successful create.
  // ---------------------------------------------------------------------------

  async onOrderCreated(
    customerId: string,
    amountBilled: number,
    amountPaid: number,
    orderDate: Date,
  ): Promise<void> {
    if (!isObjectIdOrHexString(customerId)) {
      throw new BadRequestException('Invalid customerId');
    }
    const _id = new Types.ObjectId(customerId);
    const customer = await this.repository.findOne({ _id }, {}, {}, [], true);
    if (!customer) return; // orphan: silently no-op

    const stats = customer.stats || ({} as any);
    const totalOrders = (stats.totalOrders ?? 0) + 1;
    const totalBilled = (stats.totalBilled ?? 0) + amountBilled;
    const totalPaid = (stats.totalPaid ?? 0) + amountPaid;
    const outstandingBalance =
      (customer.openingBalance ?? 0) + totalBilled - totalPaid;
    const firstOrderAt = stats.firstOrderAt ?? orderDate;
    const lastOrderAt = orderDate;
    const avgOrderValue = totalBilled / totalOrders;

    await this.repository.updateOne(_id, {
      stats: {
        totalOrders,
        totalBilled,
        totalPaid,
        outstandingBalance,
        firstOrderAt,
        lastOrderAt,
        avgOrderValue,
      },
    });
  }

  // ---------------------------------------------------------------------------
  // Helpers
  // ---------------------------------------------------------------------------

  /**
   * Derive PAN and place-of-supply state code from GSTIN when caller didn't
   * supply them. Cheap convenience — clearly documented so future contributors
   * understand why these fields can silently change.
   */
  private enrichDerivedFields<T extends Partial<CreateCustomerDto>>(
    input: T,
  ): T {
    const out: any = { ...input };
    if (out.gstin && typeof out.gstin === 'string' && out.gstin.length === 15) {
      if (!out.pan) out.pan = out.gstin.slice(2, 12);
      if (!out.placeOfSupplyStateCode) {
        out.placeOfSupplyStateCode = out.gstin.slice(0, 2);
      }
    }
    return out;
  }
}
