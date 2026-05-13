import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { CreateOrderDto } from './dto/create-order.dto';
import { OrderDocument } from './schema/order.schema';
import { LeanDocument } from '@shared/types/lean-document.interface';
import { UpdateOrderDto } from './dto/update-order.dto';
import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';
import { PaginatedResponseDto } from '@shared/dto/pagination-response.dto';
import { OrderService } from './order.service';
import { UserRole } from '@api/user/enum/user-role.enum';
import { Roles } from '@shared/decorator/roles.decorator';
import { CurrentUser } from '@shared/decorator/current-user.decorator';
import { UserDocument } from '@api/user/schema/user.schema';

@Controller({
  path: 'shop/:shopId/order',
  version: '1',
})
@Roles(UserRole.EMPLOYEE, UserRole.ADMIN, UserRole.MANAGER)
export class OrderController {
  constructor(private readonly orderService: OrderService) {}

  @Post()
  async create(
    @Param('shopId') shopId: string,
    @Body() createOrderDto: CreateOrderDto,
    @CurrentUser() user: UserDocument,
  ): Promise<LeanDocument<OrderDocument>> {
    return this.orderService.createOrder(shopId, createOrderDto, user);
  }

  @Get('invoice-id/next')
  async previewInvoiceId(
    @Param('shopId') shopId: string,
  ): Promise<{ invoiceId: string }> {
    const invoiceId = await this.orderService.previewInvoiceId(shopId);
    return { invoiceId };
  }

  @Post('paginated')
  async getPaginatedOrders(
    @Param('shopId') shopId: string,
    @Body() query: PaginationQueryDto<CreateOrderDto>,
  ): Promise<PaginatedResponseDto<LeanDocument<OrderDocument>>> {
    return this.orderService.getPaginatedOrders(shopId, query);
  }

  @Get(':id')
  async findOne(
    @Param('shopId') shopId: string,
    @Param('id') id: string,
  ): Promise<LeanDocument<OrderDocument>> {
    return this.orderService.getOrderById(shopId, id);
  }

  @Get(':id/populated')
  async findOnePopulated(
    @Param('shopId') shopId: string,
    @Param('id') id: string,
  ): Promise<LeanDocument<OrderDocument>> {
    return this.orderService.getOrderByIdPopulated(shopId, id);
  }

  @Put(':id')
  async update(
    @Param('shopId') shopId: string,
    @Param('id') id: string,
    @Body() updateOrderDto: UpdateOrderDto,
  ): Promise<LeanDocument<OrderDocument>> {
    return this.orderService.updateOrder(shopId, id, updateOrderDto);
  }

  @Delete(':id')
  async remove(
    @Param('shopId') shopId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.orderService.deleteOrder(shopId, id);
  }
}
