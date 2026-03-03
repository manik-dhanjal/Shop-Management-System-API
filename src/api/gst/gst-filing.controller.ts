import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiTags } from '@nestjs/swagger';
import { GstFilingService } from './services/gst-filing.service';
import { PrepareGstReturnDto } from './dto/prepare-gst-return.dto';
import { FileGstReturnDto } from './dto/file-gst-return.dto';

@ApiTags('GST Filing')
@Controller({
  path: '/shop/:shopId/gst',
  version: '1',
})
export class GstFilingController {
  constructor(private readonly gstFilingService: GstFilingService) {}

  @Post('prepare')
  @ApiOperation({
    summary: 'Prepare GST return data from shop orders',
    description:
      'Aggregates orders for the specified period, builds GSTR1/GSTR3B data, and optionally runs AI analysis to surface insights and warnings.',
  })
  @ApiParam({ name: 'shopId', description: 'Shop ID' })
  async prepareReturn(
    @Param('shopId') shopId: string,
    @Body() dto: PrepareGstReturnDto,
  ) {
    return this.gstFilingService.prepareReturn(shopId, dto);
  }

  @Post('file')
  @ApiOperation({
    summary: 'File a prepared GST return via Whitebooks GST API',
    description:
      'Submits a previously prepared GST return to the GST portal using the provided auth token.',
  })
  @ApiParam({ name: 'shopId', description: 'Shop ID' })
  async fileReturn(
    @Param('shopId') shopId: string,
    @Body() dto: FileGstReturnDto,
  ) {
    return this.gstFilingService.fileReturn(shopId, dto);
  }

  @Get('filings')
  @ApiOperation({
    summary: 'List all GST filing records for a shop',
  })
  @ApiParam({ name: 'shopId', description: 'Shop ID' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  async getFilings(
    @Param('shopId') shopId: string,
    @Query('page') page = 1,
    @Query('limit') limit = 10,
  ) {
    return this.gstFilingService.getFilingsForShop(shopId, +page, +limit);
  }

  @Get('filings/:filingId')
  @ApiOperation({
    summary: 'Get status and details of a specific GST filing record',
  })
  @ApiParam({ name: 'shopId', description: 'Shop ID' })
  @ApiParam({ name: 'filingId', description: 'Filing record ID' })
  async getFilingStatus(
    @Param('shopId') shopId: string,
    @Param('filingId') filingId: string,
  ) {
    return this.gstFilingService.getFilingStatus(shopId, filingId);
  }
}
