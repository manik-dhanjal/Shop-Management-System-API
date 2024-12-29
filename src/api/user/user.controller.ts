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

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @NoAuth()
  @Post('register')
  async register(@Body() newUser: CreateUserDto): Promise<UserTokensDto> {
    return this.userService.createUser(newUser);
  }

  @NoAuth()
  @Post('login')
  async login(
    @Body() userCreds: Pick<CreateUserDto, 'email' | 'password'>,
  ): Promise<UserTokensDto> {
    return this.userService.validateUser(userCreds);
  }

  @Get('profile')
  async getUserByAccessToken(
    @Request() req,
  ): Promise<LeanDocument<UserDocument>> {
    return req.user;
  }

  @NoAuth()
  @Get('access-token')
  async getAccessToken(@Request() req): Promise<UserTokenDto> {
    const [type, token] = req.headers.authorization?.split(' ') ?? [];
    const refreshToken = type === 'Bearer' ? token : null;
    if (!refreshToken) {
      throw new UnauthorizedException('refresh token is missing');
    }
    return this.userService.getAccessToken(refreshToken);
  }

  @Patch(':userId')
  async updateUser(
    @Body() user: UpdateUserDto,
    @Param('userId') userId: string,
  ): Promise<LeanDocument<UserDocument>> {
    return this.userService.updateUser(userId, user);
  }
}
