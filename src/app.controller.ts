import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { NoAuth } from '@shared/decorator/no-auth.decorator';
import { ApiProperty, ApiTags } from '@nestjs/swagger';

@NoAuth()
@Controller()
@ApiTags('Health Check')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiProperty({
    description: 'Health check endpoint',
    example: 'Hello World!',
  })
  @Get('health')
  getHello(): string {
    return this.appService.getHello();
  }
}
