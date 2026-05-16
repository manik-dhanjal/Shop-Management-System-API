import {
  Injectable,
  BadRequestException,
  Inject,
  OnModuleInit,
} from '@nestjs/common';
import { GetDropdownOptionsDto } from './dto/get-dropdown-options.dto';
import { OrderService } from '@api/orders/order.service';
import { ProductService } from '@api/products/product.service';
import { CustomerService } from '@api/customer/customer.service';
import { SupplierService } from '@api/supplier/supplier.service';
import { PaginatedResponseDto } from '@shared/dto/pagination-response.dto';
import { LeanDocument } from '@shared/types/lean-document.interface';

type EntityFetcher = (
  shopId: string,
  query: any,
) => Promise<PaginatedResponseDto<LeanDocument<unknown>>>;

@Injectable()
export class FormService implements OnModuleInit {
  private entityDataMap: Record<string, EntityFetcher>;
  constructor(
    private readonly orderService: OrderService,
    private readonly productService: ProductService,
    private readonly supplierService: SupplierService,
    @Inject()
    private readonly customerService: CustomerService,
  ) {}

  onModuleInit() {
    this.entityDataMap = {
      order: this.orderService.getPaginatedOrders.bind(this.orderService),
      product: this.productService.getPaginatedProducts.bind(
        this.productService,
      ),
      supplier: this.supplierService.getPaginatedSuppliers.bind(
        this.supplierService,
      ),
      customer: this.customerService.getPaginatedCustomer.bind(
        this.customerService,
      ),
    };
  }
  /**
   * Fetches dropdown options for a specified entity type
   * @param payload - Contains entityType, valueField, and labelField
   * @returns Array of dropdown options
   */
  async getDropdownOptions(
    shopId: string,
    payload: GetDropdownOptionsDto,
  ): Promise<PaginatedResponseDto<{ value: any; label: string }>> {
    const { entityType, valueField, labelField } = payload;

    if (!this.entityDataMap[entityType]) {
      throw new BadRequestException(
        `Entity type '${entityType}' is not supported`,
      );
    }

    const data = (await this.entityDataMap[entityType](
      shopId,
      payload.query,
    )) as PaginatedResponseDto<LeanDocument<unknown>>; // Fetch data based on entity type

    // Map the data to dropdown format
    data.docs = data.docs.map((item: Record<string, any>) => ({
      value: item[valueField],
      label: item[labelField],
    }));
    return data as PaginatedResponseDto<{ value: any; label: string }>; // Return mapped dropdown options
  }
}
