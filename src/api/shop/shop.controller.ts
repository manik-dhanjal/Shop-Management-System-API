import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Logger,
  Param,
  Patch,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { LeanDocument } from '@shared/types/lean-document.interface';
import { ShopDocument } from './schema/shop.schema';
import { CreateShopDto } from './dto/create-shop.dto';
import { ShopService } from './shop.service';
import { UpdateShopDto } from './dto/update-shop.dto';
import { Roles } from '@shared/decorator/roles.decorator';
import { UserRole } from '@api/user/enum/user-role.enum';
import { CurrentUser } from '@shared/decorator/current-user.decorator';
import { UserDocument } from '@api/user/schema/user.schema';
import { toShopResponse } from './dto/shop-response.dto';
import { GstVerificationService } from './gst-verification.service';
import { OtpRequestDto, OtpVerifyDto } from './dto/gst-verify.dto';

@Controller({ path: 'shop', version: '1' })
export class ShopController {
  private readonly logger = new Logger(ShopController.name);

  constructor(
    private readonly service: ShopService,
    private readonly gstVerificationService: GstVerificationService,
  ) {}

  // ---- My shops (caller's accessible shops) ----

  @Get('mine')
  async getMyShops(
    @CurrentUser() user: UserDocument,
    @Query('q') q?: string,
  ) {
    return this.service.getMyShops(user, q);
  }

  @Get('mine/stats')
  async getMyShopsStats(@CurrentUser() user: UserDocument) {
    return this.service.getMyShopsStats(user);
  }

  // ---- Create / read / update / delete ----

  @Post()
  async createShop(
    @Body() newShop: CreateShopDto,
    @Request() req,
  ) {
    const shop = await this.service.createShop(req.user, newShop);
    return toShopResponse(shop);
  }

  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN, UserRole.MANAGER)
  @Get(':shopId')
  async getShop(
    @Param('shopId') shopId: string,
    @CurrentUser() user: UserDocument,
  ) {
    const shop = await this.service.getShopById(shopId, user);
    return toShopResponse(shop, shop.myRoles);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':shopId')
  async updateShop(
    @Param('shopId') shopId: string,
    @Body() updatedShop: UpdateShopDto,
  ) {
    const shop = await this.service.updateShop(shopId, updatedShop);
    return toShopResponse(shop);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':shopId')
  async deleteShop(
    @Param('shopId') shopId: string,
    @CurrentUser() user: UserDocument,
  ): Promise<void> {
    return this.service.deleteShop(shopId, user);
  }

  // ---- GST verification ----

  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.NO_CONTENT)
  @Post(':shopId/gst/request-otp')
  async requestGstOtp(
    @Param('shopId') shopId: string,
    @Body() body: OtpRequestDto,
  ): Promise<void> {
    this.logger.debug(`[GST] request-otp shopId=${shopId} gstin=${body.gstin}`);
    return this.gstVerificationService.requestOtp(body.gstin);
  }

  @Roles(UserRole.ADMIN)
  @Post(':shopId/gst/verify')
  async verifyGstOtp(
    @Param('shopId') shopId: string,
    @Body() body: OtpVerifyDto,
  ) {
    this.logger.debug(
      `[GST] verify shopId=${shopId} gstin=${body.gstin} email=${body.email ?? '(none)'}`,
    );
    const result = await this.gstVerificationService.verifyWithOtp(
      shopId,
      body.gstin,
      body.otp,
      body.email,
    );
    this.logger.debug(
      `[GST] verify success shopId=${shopId} gstin=${body.gstin} legalName=${result.legalName} status=${result.status}`,
    );
    return result;
  }

  // ---- Members (team & roles) ----

  @Roles(UserRole.EMPLOYEE, UserRole.ADMIN, UserRole.MANAGER)
  @Get(':shopId/members')
  async listMembers(@Param('shopId') shopId: string) {
    return this.service.listMembers(shopId);
  }

  @Roles(UserRole.ADMIN)
  @Post(':shopId/members')
  async inviteMember(
    @Param('shopId') shopId: string,
    @Body()
    body: {
      email: string;
      roles: UserRole[];
      firstName?: string;
      lastName?: string;
    },
  ) {
    return this.service.inviteMember(shopId, body);
  }

  @Roles(UserRole.ADMIN)
  @Patch(':shopId/members/:userId')
  async updateMemberRoles(
    @Param('shopId') shopId: string,
    @Param('userId') userId: string,
    @Body() body: { roles: UserRole[] },
  ): Promise<void> {
    return this.service.updateMemberRoles(shopId, userId, body.roles);
  }

  @Roles(UserRole.ADMIN)
  @Delete(':shopId/members/:userId')
  async removeMember(
    @Param('shopId') shopId: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    return this.service.removeMember(shopId, userId);
  }
}
