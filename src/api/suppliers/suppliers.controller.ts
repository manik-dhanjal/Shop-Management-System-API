import { Controller, Get } from '@nestjs/common';

@Controller('api/shop/:shop/supplier')
export class SuppliersController {
  constructor() {}

  @Get()
  async getSuppliers(): Promise<string> {
    return 'Hi, There';
  }
}
