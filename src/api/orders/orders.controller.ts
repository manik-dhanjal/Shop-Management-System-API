import { Controller, Get } from '@nestjs/common';

@Controller('api/shop/:shop/order')
export class OrdersController {
  constructor() {}

  @Get()
  async getOrders(): Promise<string> {
    return 'Hi, There';
  }
}
