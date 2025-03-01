import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CustomerService } from './customer.service';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';
import { PaginatedResponseDto } from '@shared/dto/pagination-response.dto';

@Controller('customers')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post(':shopId')
  async createCustomer(
    @Param('shopId') shopId: string,
    @Body() createCustomerDto: CreateCustomerDto,
  ) {
    return this.customerService.createCustomer(shopId, createCustomerDto);
  }

  @Get(':shopId/:customerId')
  async getCustomerById(
    @Param('shopId') shopId: string,
    @Param('customerId') customerId: string,
  ) {
    return this.customerService.getCustomerById(shopId, customerId);
  }

  @Patch(':shopId/:customerId')
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

  @Get(':shopId')
  async getPaginatedCustomers(
    @Param('shopId') shopId: string,
    @Query() query: PaginationQueryDto<CreateCustomerDto>,
  ): Promise<PaginatedResponseDto<any>> {
    return this.customerService.getPaginatedCustomer(shopId, query);
  }

  @Delete(':shopId/:customerId')
  async deleteCustomer(
    @Param('shopId') shopId: string,
    @Param('customerId') customerId: string,
  ) {
    return this.customerService.deleteCustomer(shopId, customerId);
  }
}
