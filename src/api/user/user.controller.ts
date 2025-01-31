import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserTokenDto, UserTokensDto } from './dto/user-token.dto';
import { LeanDocument } from '@shared/types/lean-document.interface';
import { UserDocument } from './schema/user.schema';
import { NoAuth } from '@shared/decorator/no-auth.decorator';
import { UpdateUserDto } from './dto/update-user.dto';
import { Roles } from '@shared/decorator/roles.decorator';
import { UserRole } from './enum/user-role.enum';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { PaginatedResponseDto } from '@shared/dto/pagination-response.dto';
import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) {}

  @NoAuth()
  @Post('user/register')
  async register(@Body() newUser: CreateUserDto): Promise<UserTokensDto> {
    return this.userService.registerUser(newUser);
  }

  @NoAuth()
  @Post('user/login')
  async login(
    @Body() userCreds: Pick<CreateUserDto, 'email' | 'password'>,
  ): Promise<UserTokensDto> {
    return this.userService.validateUser(userCreds);
  }

  @Get('user/me')
  async getUserByAccessToken(
    @Request() req,
  ): Promise<LeanDocument<UserDocument>> {
    return req.user;
  }

  @NoAuth()
  @Get('user/access-token')
  async getAccessToken(@Request() req): Promise<UserTokenDto> {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    const refreshToken = type === 'Bearer' ? token : null;
    if (!refreshToken) {
      throw new UnauthorizedException('refresh token is missing');
    }
    return this.userService.getAccessToken(refreshToken);
  }

  @Patch('user/:userId')
  async updateUser(
    @Body() user: UpdateUserDto,
    @Param('userId') userId: string,
  ): Promise<LeanDocument<UserDocument>> {
    return this.userService.updateUser(userId, user);
  }

  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Post('shop/:shopId/user/employee')
  async createEmployee(
    @Param('shopId') shopId: string,
    @Body() user: CreateEmployeeDto,
  ): Promise<LeanDocument<UserDocument>> {
    return this.userService.createEmployee(shopId, user);
  }

  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Post('shop/:shopId/user/employee/paginated')
  async getPaginatedEmployee(
    @Param('shopId') shopId: string,
    @Body() query: PaginationQueryDto<CreateEmployeeDto>,
  ): Promise<PaginatedResponseDto<LeanDocument<UserDocument>>> {
    return this.userService.getPaginatedEmployees(shopId, query);
  }

  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Get('shop/:shopId/user/employee/:employeeId')
  async getEmployeeById(
    @Param('shopId') shopId: string,
    @Param('employeeId') employeeId: string,
  ): Promise<LeanDocument<UserDocument>> {
    return this.userService.getUserByIdAndShopId(shopId, employeeId);
  }

  @Roles(UserRole.ADMIN, UserRole.MANAGER)
  @Patch('shop/:shopId/user/employee/:employeeId')
  async updateEmployee(
    @Param('shopId') shopId: string,
    @Param('employeeId') employeeId: string,
    @Body() userData: UpdateUserDto,
  ): Promise<LeanDocument<UserDocument>> {
    return this.userService.updateEmployee(shopId, employeeId, userData);
  }
}
