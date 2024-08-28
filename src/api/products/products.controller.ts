import { Controller, Get } from '@nestjs/common';

@Controller('api/shop/:shop/product')
export class ProductsController {
  constructor() {}

  @Get()
  async getProducts(): Promise<string> {
    return 'Hi, There';
  }
}
