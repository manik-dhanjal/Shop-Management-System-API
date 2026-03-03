import {
  Controller,
  Get,
  Post,
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
  ) {
    return this.customerService.createCustomer(shopId, createCustomerDto);
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
  ) {
    return this.customerService.updateCustomer(
      shopId,
      customerId,
      updateCustomerDto,
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
  ) {
    return this.customerService.deleteCustomer(shopId, customerId);
  }
}
