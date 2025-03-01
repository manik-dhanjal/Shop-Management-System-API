import { Injectable, UnauthorizedException } from '@nestjs/common';
import { OrderRepository } from './repository/order.repository';
import { CreateOrderDto } from './dto/create-order.dto';
import { LeanDocument } from '@shared/types/lean-document.interface';
import { OrderDocument } from './schema/order.schema';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';
import { PaginatedResponseDto } from '@shared/dto/pagination-response.dto';
import { Types } from 'mongoose';

@Injectable()
export class OrderService {
  constructor(private readonly orderRepository: OrderRepository) {}

  async createOrder(
    shopId: string,
    createOrderDto: CreateOrderDto,
  ): Promise<LeanDocument<OrderDocument>> {
    if (createOrderDto.shop !== shopId) throw new UnauthorizedException();
    return this.orderRepository.create(createOrderDto);
  }

  async getOrderById(shopId: string, orderId: string) {
    return this.orderRepository.findOne({ _id: orderId, shop: shopId });
  }

  async getPaginatedOrders(
    shopId: string,
    query: PaginationQueryDto<CreateOrderDto>,
  ): Promise<PaginatedResponseDto<LeanDocument<OrderDocument>>> {
    // Set default values for page and limit if not provided
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
      ['images'],
    );
  }

  async updateOrder(
    shopId: string,
    orderId: string,
    updateData: UpdateOrderDto,
  ) {
    const existingOrder = await this.orderRepository.findOne({
      _id: orderId,
      shop: shopId,
    });
    if (existingOrder) throw new UnauthorizedException();
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
