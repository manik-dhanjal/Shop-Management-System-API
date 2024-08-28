import { Controller, Get } from '@nestjs/common';

@Controller('api/shop/:shop/inventory')
export class InventoryController {
  constructor() {}

  @Get()
  async getInventory(): Promise<string> {
    return 'Hi, There';
  }
}
