import {
  ConflictException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { UserRepository } from './repository/user.repository';
import { CreateUserDto } from './dto/create-user.dto';
import * as bcrypt from 'bcrypt';
import { LeanDocument } from '@shared/types/lean-document.interface';
import { UserDocument } from './schema/user.schema';
import * as jwt from 'jsonwebtoken';
import { USER_CONFIG_NAME, UserConfig } from '@config/user.config';
import { ConfigService } from '@nestjs/config';
import ms from 'ms';
import { UserTokenDto, UserTokensDto } from './dto/user-token.dto';
import { pick as _pick } from 'lodash';
import { UserTokenPayload } from './interface/user-token-payload.interface';
import { UserTokenType } from './enum/user-token-type.enum';
import { UpdateUserDto } from './dto/update-user.dto';
import mongoose, { isObjectIdOrHexString, Types, UpdateQuery } from 'mongoose';
import { ShopDocument } from '@api/shop/schema/shop.schema';
import { UserRole } from './enum/user-role.enum';
import { CreateEmployeeDto } from './dto/create-employee.dto';
import { PaginatedResponseDto } from '@shared/dto/pagination-response.dto';
import { PaginationQueryDto } from '@shared/dto/pagination-query.dto';

@Injectable()
export class UserService {
  private readonly userConfig: UserConfig;
  constructor(
    private readonly repository: UserRepository,
    configService: ConfigService,
  ) {
    this.userConfig = configService.get<UserConfig>(USER_CONFIG_NAME);
  }

  async registerUser(user: CreateUserDto): Promise<UserTokensDto> {
    const existingUser = await this.repository.findOne(
      {
        email: user.email,
        isActive: true,
      },
      {},
      {},
      [],
      true,
    );
    if (existingUser) {
      throw new ConflictException(
        `User with email ${user.email} already exists.`,
      );
    }
    const hashedPassword = await bcrypt.hash(
      user.password,
      this.userConfig.passwordSaltRounds,
    );
    const newUser = await this.repository.create({
      ...user,
      password: hashedPassword,
    });
    return {
      access: this.generateAccessToken(newUser),
      refresh: this.generateRefreshToken(newUser),
    };
  }

  async createEmployee(
    shopId: string,
    user: CreateEmployeeDto,
  ): Promise<LeanDocument<UserDocument>> {
    const existingUser = await this.repository.findOne(
      {
        email: user.email,
        isActive: true,
      },
      {},
      {},
      [],
      true,
    );
    if (existingUser) {
      throw new ConflictException(
        `User with email ${user.email} already exists.`,
      );
    }
    // TODO: create a link and send it to employee to generate password
    return this.repository.create({
      ...user,
      shopsMeta: [{ shop: shopId, roles: [UserRole.EMPLOYEE] }],
    });
  }

  async validateUser(
    userCreds: Pick<CreateUserDto, 'email' | 'password'>,
  ): Promise<UserTokensDto> {
    const user = await this.repository.findOne(
      {
        email: userCreds.email,
        isActive: true,
      },
      {},
      {},
      [],
      true,
    );
    if (!user || !user.password)
      throw new UnauthorizedException('Invalid user email or password');

    const isPasswordValid = await bcrypt.compare(
      userCreds.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid user email or password');
    }
    return {
      access: this.generateAccessToken(user),
      refresh: this.generateRefreshToken(user),
    };
  }

  async getAccessToken(refreshToken: string): Promise<UserTokenDto> {
    let tokenPayload: jwt.JwtPayload;
    try {
      tokenPayload = jwt.verify(
        refreshToken,
        this.userConfig.jwtSecret,
      ) as jwt.JwtPayload;
    } catch (error) {
      throw new UnauthorizedException(error.message);
    }

    if (
      !tokenPayload.userId ||
      tokenPayload.tokenType !== UserTokenType.REFRESH_TOKEN
    ) {
      throw new UnauthorizedException(
        'Bearer token is not a valid access token',
      );
    }

    const user = await this.getUserById(tokenPayload.userId);
    if (!user) {
      new UnauthorizedException(
        'refresh token is not valid for requested user.',
      );
    }
    return this.generateAccessToken(user);
  }

  async getUserById(
    userId: string,
  ): Promise<LeanDocument<UserDocument> | null> {
    return this.repository.findOne(
      {
        _id: userId,
        isActive: true,
      },
      {},
      {},
      ['shopsMeta.shop'],
      true,
    );
  }

  async updateUser(
    userId: string,
    userToUpdate: UpdateUserDto,
  ): Promise<LeanDocument<UserDocument>> {
    if (!isObjectIdOrHexString(userId)) {
      throw new UnauthorizedException('Invalid userId');
    }
    const mongoUserId = new mongoose.Types.ObjectId(userId);
    await this.repository.findOne(mongoUserId);
    return this.repository.updateOne(mongoUserId, userToUpdate);
  }

  async updateUserWithQuery(
    id: Types.ObjectId,
    updateQuery: UpdateQuery<UserDocument>,
  ): Promise<LeanDocument<UserDocument>> {
    return this.repository.updateOne(id, updateQuery);
  }

  private generateAccessToken(user: LeanDocument<UserDocument>): UserTokenDto {
    const shopsMeta = user.shopsMeta.map((shopMeta) => {
      return {
        shop: (shopMeta.shop as ShopDocument)._id.toString(),
        roles: shopMeta.roles,
      };
    });
    const tokenPayload: UserTokenPayload = {
      tokenType: UserTokenType.ACCESS_TOKEN,
      userId: user._id.toString(),
      shopsMeta,
      ..._pick(user, ['email', 'firstName', 'lastName']),
    };
    const accessToken = jwt.sign(
      { ...tokenPayload },
      this.userConfig.jwtSecret,
      {
        expiresIn: this.userConfig.accessJwtExpiresIn,
      },
    );

    return {
      token: accessToken,
      expiresIn: ms(this.userConfig.accessJwtExpiresIn),
      expiresOn: new Date().getTime() + ms(this.userConfig.accessJwtExpiresIn),
    };
  }

  private generateRefreshToken(user: LeanDocument<UserDocument>): UserTokenDto {
    const shopsMeta = user.shopsMeta.map((shopMeta) => {
      return {
        shop: (shopMeta.shop as ShopDocument)._id.toString(),
        roles: shopMeta.roles,
      };
    });
    const tokenPayload: UserTokenPayload = {
      tokenType: UserTokenType.REFRESH_TOKEN,
      userId: user._id.toString(),
      shopsMeta,
      ..._pick(user, ['email', 'firstName', 'lastName']),
    };

    const refreshToken = jwt.sign(tokenPayload, this.userConfig.jwtSecret, {
      expiresIn: this.userConfig.refreshJwtExpiresIn,
    });
    return {
      token: refreshToken,
      expiresIn: ms(this.userConfig.refreshJwtExpiresIn),
      expiresOn: new Date().getTime() + ms(this.userConfig.refreshJwtExpiresIn),
    };
  }

  async getPaginatedEmployees(
    shopId: string,
    query: PaginationQueryDto<CreateEmployeeDto>,
  ): Promise<PaginatedResponseDto<LeanDocument<UserDocument>>> {
    // Set default values for page and limit if not provided
    const skip = (query.page - 1) * query.limit;
    return this.repository.findWithPagination(
      {
        'shopsMeta.shop': shopId,
        ...query.filter,
      },
      undefined,
      query.sort,
      skip,
      query.limit,
      ['profileImage'],
    );
  }

  async getUserByIdAndShopId(
    shopId: string,
    userId: string,
  ): Promise<LeanDocument<UserDocument> | null> {
    return this.repository.findOne(
      {
        _id: userId,
        isActive: true,
        'shopsMeta.shop': shopId,
      },
      {},
      {},
      ['profileImage'],
      true,
    );
  }

  async updateEmployee(
    shopId: string,
    employeeId: string,
    userData: UpdateUserDto,
  ): Promise<LeanDocument<UserDocument>> {
    if (!isObjectIdOrHexString(employeeId))
      throw new UnauthorizedException('Invalid employee ID');

    const userRecord = this.repository.findOne({
      _id: employeeId,
      isActive: true,
      'shopsMeta.shop': shopId,
    });

    if (!userRecord)
      throw new UnauthorizedException(
        'You are not authorized to access this employee record',
      );

    return this.repository.updateOne(new Types.ObjectId(employeeId), {
      ...userData,
      profileImage: userData.profileImage || null,
    });
  }
}
