import { Body, Controller, Get, Param, Patch, Post } from '@nestjs/common';
import { UserService } from './user.service';
import { Roles } from '@shared/decorator/roles.decorator';
import { UserRole } from './enum/user-role.enum';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { UserDocument } from './schema/user.schema';
import { LeanDocument } from '@shared/types/lean-document.interface';
import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';
import { PaginatedResponseDto } from '@shared/dto/pagination-response.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller({
  version: '1',
  path: 'shop/:shopId/employee',
})
@Roles(UserRole.ADMIN, UserRole.MANAGER)
export class EmployeeController {
  constructor(private readonly userService: UserService) {}

  @Post()
  async createEmployee(
    @Param('shopId') shopId: string,
    @Body() user: CreateEmployeeDto,
  ): Promise<LeanDocument<UserDocument>> {
    return this.userService.createEmployee(shopId, user);
  }

  @Post('paginated')
  async getPaginatedEmployee(
    @Param('shopId') shopId: string,
    @Body() query: PaginationQueryDto<CreateEmployeeDto>,
  ): Promise<PaginatedResponseDto<LeanDocument<UserDocument>>> {
    return this.userService.getPaginatedEmployees(shopId, query);
  }

  @Get(':employeeId')
  async getEmployeeById(
    @Param('shopId') shopId: string,
    @Param('employeeId') employeeId: string,
  ): Promise<LeanDocument<UserDocument>> {
    return this.userService.getUserByIdAndShopId(shopId, employeeId);
  }

  @Patch(':employeeId')
  async updateEmployee(
    @Param('shopId') shopId: string,
    @Param('employeeId') employeeId: string,
    @Body() userData: UpdateUserDto,
  ): Promise<LeanDocument<UserDocument>> {
    return this.userService.updateEmployee(shopId, employeeId, userData);
  }
}
