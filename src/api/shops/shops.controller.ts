import { Controller, Get } from '@nestjs/common';

@Controller('api/shop')
export class ShopsController {
  constructor() {}

  @Get()
  async getShops(): Promise<string> {
    return 'Hi, There';
  }
}
