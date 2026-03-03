import {
  Injectable,
  BadRequestException,
  Inject,
  OnModuleInit,
} from '@nestjs/common';
import { GetDropdownOptionsDto } from './dto/get-dropdown-options.dto';
import { OrderService } from '@api/orders/order.service';
import { ProductService } from '@api/products/product.service';
import { ShopService } from '@api/shop/shop.service';
import { CustomerService } from '@api/customer/customer.service';
import { PaginatedResponseDto } from '@shared/dto/pagination-response.dto';
import { LeanDocument } from '@shared/types/lean-document.interface';

@Injectable()
export class FormService implements OnModuleInit {
  private entityDataMap: Record<string, Function>;
  constructor(
    private readonly orderService: OrderService,
    private readonly productService: ProductService,
    private readonly shopService: ShopService,
    @Inject()
    private readonly customerService: CustomerService,
  ) {}

  onModuleInit() {
    this.entityDataMap = {
      // Define entity type mappings and their corresponding data
      order: this.orderService.getPaginatedOrders.bind(this.orderService), // Example: Fetch all orders
      product: this.productService.getPaginatedProducts.bind(
        this.productService,
      ), // Example: Fetch all products
      supplier: this.shopService.getPaginatedSuppliers.bind(this.shopService), // Example: Fetch all shops
      customer: this.customerService.getPaginatedCustomer.bind(
        this.customerService,
      ), // Example: Fetch all customers
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

    const a = await this.customerService.getPaginatedCustomer(
      shopId,
      payload.query,
    );
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
