import { Controller, Get } from '@nestjs/common';

@Controller({
  version: '1',
  path: 'shop/:shop/inventory',
})
export class InventoryController {
  constructor() {}

  @Get()
  async getInventory(): Promise<string> {
    return 'Hi, There';
  }
}
