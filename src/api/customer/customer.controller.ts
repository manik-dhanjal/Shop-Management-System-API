import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Param,
  Body,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PaginatedResponseDto } from '@shared/dto/pagination-response.dto';
import { PaginatedCustomerQueryDto } from './dto/paginated-customer-query.dto';
import { CurrentUser } from '@shared/decorator/current-user.decorator';
import { UserDocument } from '@api/user/schema/user.schema';

@Controller({
  path: '/shop/:shopId/customer',
  version: '1',
})
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post()
  async createCustomer(
    @Param('shopId') shopId: string,
    @Body() createCustomerDto: CreateCustomerDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.customerService.createCustomer(shopId, createCustomerDto, user);
  }

  @Put()
  async upsertCustomer(
    @Param('shopId') shopId: string,
    @Body() customerDto: CreateCustomerDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.customerService.upsertCustomerByPhone(
      shopId,
      customerDto,
      user,
    );
  }

  @Get('code/next')
  async previewCustomerCode(
    @Param('shopId') shopId: string,
  ): Promise<{ customerCode: string }> {
    const customerCode =
      await this.customerService.peekNextCustomerCode(shopId);
    return { customerCode };
  }

  @Get('stats')
  async getCustomerStats(@Param('shopId') shopId: string) {
    return this.customerService.getShopCustomerStats(shopId);
  }

  @Get(':customerId')
  async getCustomerById(
    @Param('shopId') shopId: string,
    @Param('customerId') customerId: string,
  ) {
    return this.customerService.getCustomerById(shopId, customerId);
  }

  @Patch(':customerId')
  async updateCustomer(
    @Param('shopId') shopId: string,
    @Param('customerId') customerId: string,
    @Body() updateCustomerDto: UpdateCustomerDto,
    @CurrentUser() user: UserDocument,
  ) {
    return this.customerService.updateCustomer(
      shopId,
      customerId,
      updateCustomerDto,
      user,
    );
  }

  @Post('paginated')
  async getPaginatedCustomers(
    @Param('shopId') shopId: string,
    @Body() query: PaginatedCustomerQueryDto,
  ): Promise<PaginatedResponseDto<any>> {
    return this.customerService.getPaginatedCustomer(shopId, query);
  }

  @Delete(':customerId')
  async deleteCustomer(
    @Param('shopId') shopId: string,
    @Param('customerId') customerId: string,
    @CurrentUser() user: UserDocument,
  ) {
    return this.customerService.deleteCustomer(shopId, customerId, user);
  }
}
