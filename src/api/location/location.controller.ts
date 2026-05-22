import { Controller, Get, HttpCode, Param, Post, Query, Header } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { NoAuth } from '@shared/decorator/no-auth.decorator';
import { Roles } from '@shared/decorator/roles.decorator';
import { UserRole } from '@api/user/enum/user-role.enum';
import { LocationService } from './location.service';
import { LocationSyncService } from './location-sync.service';
import { CityQueryDto, PincodeLookupResultDto } from './dto/city.dto';
import { CountryDto } from './dto/country.dto';
import { StateDto } from './dto/state.dto';

const PUBLIC_CACHE = 'public, max-age=86400, immutable';

@ApiTags('Location')
@NoAuth()
@Controller({ path: 'location', version: '1' })
export class LocationController {
  constructor(
    private readonly service: LocationService,
    private readonly syncService: LocationSyncService,
  ) {}

  @Post('sync')
  @Roles(UserRole.ADMIN)
  @HttpCode(202)
  @ApiOperation({ summary: 'Trigger manual location data sync (admin)' })
  async triggerSync() {
    this.syncService.syncLocationData();
    return { message: 'Location sync started' };
  }

  @Get('countries')
  @Header('Cache-Control', PUBLIC_CACHE)
  @ApiOperation({ summary: 'List all countries' })
  @ApiResponse({ status: 200, type: [CountryDto] })
  async getCountries() {
    return this.service.getCountries();
  }

  @Get('countries/:code/states')
  @Header('Cache-Control', PUBLIC_CACHE)
  @ApiOperation({ summary: 'List states / provinces for a country' })
  @ApiParam({ name: 'code', example: 'IN' })
  @ApiResponse({ status: 200, type: [StateDto] })
  async getStates(@Param('code') code: string) {
    return this.service.getStatesByCountry(code);
  }

  @Get('countries/:code/states/:stateCode/cities')
  @ApiOperation({ summary: 'List or search cities for a state' })
  @ApiParam({ name: 'code', example: 'IN' })
  @ApiParam({ name: 'stateCode', example: '27' })
  @ApiQuery({ name: 'q', required: false, description: 'Search term' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  async getCities(
    @Param('code') code: string,
    @Param('stateCode') stateCode: string,
    @Query() query: CityQueryDto,
  ) {
    return this.service.getCitiesByState(code, stateCode, query.q, query.limit);
  }

  @Get('countries/:code/pincode/:pincode')
  @ApiOperation({ summary: 'Reverse lookup pincode → city/state' })
  @ApiParam({ name: 'code', example: 'IN' })
  @ApiParam({ name: 'pincode', example: '400001' })
  @ApiResponse({ status: 200, type: PincodeLookupResultDto })
  @ApiResponse({ status: 404, description: 'Pincode not found' })
  async lookupPincode(@Param('code') code: string, @Param('pincode') pincode: string) {
    return this.service.lookupPincode(code, pincode);
  }

  @Get('countries/:code/cities/:cityId/pincodes')
  @ApiOperation({ summary: 'Full pincode list for a city' })
  @ApiParam({ name: 'code', example: 'IN' })
  @ApiParam({ name: 'cityId', description: 'MongoDB ObjectId of the city' })
  async getCityPincodes(
    @Param('code') _code: string,
    @Param('cityId') cityId: string,
  ) {
    return this.service.getCityPincodes(cityId);
  }
}
