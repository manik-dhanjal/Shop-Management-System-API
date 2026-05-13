import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { OrderRepository } from './repository/order.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { LeanDocument } from '@shared/types/lean-document.interface';
import { OrderDocument } from './schema/order.schema';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';
import { PaginatedResponseDto } from '@shared/dto/pagination-response.dto';
import { Types } from 'mongoose';
import { InvoiceNumberService } from './invoice-number.service';
import { ProductService } from '@api/products/product.service';
import { UserDocument } from '@api/user/schema/user.schema';

@Injectable()
export class OrderService {
  constructor(
    private readonly orderRepository: OrderRepository,
    private readonly invoiceNumberService: InvoiceNumberService,
    private readonly productService: ProductService,
  ) {}

  async createOrder(
    shopId: string,
    createOrderDto: CreateOrderDto,
    user: UserDocument,
  ): Promise<LeanDocument<OrderDocument>> {
    if (createOrderDto.shop !== shopId) throw new UnauthorizedException();

    await this.productService.assertAndDecrementStock(
      shopId,
      createOrderDto.items.map((it) => ({
        productId: it.product,
        quantity: it.quantity,
      })),
    );

    const invoiceId =
      createOrderDto.invoiceId ||
      (await this.invoiceNumberService.generate(shopId));

    return this.orderRepository.create({
      ...createOrderDto,
      invoiceId,
      billedBy: user._id,
    });
  }

  async previewInvoiceId(shopId: string): Promise<string> {
    return this.invoiceNumberService.peek(shopId);
  }

  async getOrderById(shopId: string, orderId: string) {
    return this.orderRepository.findOne({ _id: orderId, shop: shopId });
  }

  async getOrderByIdPopulated(shopId: string, orderId: string) {
    return this.orderRepository.findOne(
      { _id: orderId, shop: shopId },
      {},
      {},
      ['customer', 'items.product'],
    );
  }

  async getPaginatedOrders(
    shopId: string,
    query: PaginationQueryDto<CreateOrderDto>,
  ): Promise<PaginatedResponseDto<LeanDocument<OrderDocument>>> {
    const skip = (query.page - 1) * query.limit;
    return this.orderRepository.findWithPagination(
      {
        shop: shopId,
        ...query.filter,
      },
      undefined,
      query.sort,
      skip,
      query.limit,
      ['customer'],
    );
  }

  async updateOrder(
    shopId: string,
    orderId: string,
    updateData: UpdateOrderDto,
  ) {
    const existingOrder = await this.orderRepository.findOne(
      {
        _id: orderId,
        shop: shopId,
      },
      {},
      {},
      [],
      true,
    );
    if (!existingOrder) throw new NotFoundException('Order not found');
    return this.orderRepository.updateOne(
      new Types.ObjectId(orderId),
      updateData,
    );
  }

  async deleteOrder(shopId: string, orderId: string) {
    return this.orderRepository.delete({
      shop: shopId,
      _id: orderId,
    });
  }
}
