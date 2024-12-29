import {
  ConflictException,
  Injectable,
  NotFoundException,
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
import mongoose, { isObjectIdOrHexString } from 'mongoose';

@Injectable()
export class UserService {
  private readonly userConfig: UserConfig;
  constructor(
    private readonly repository: UserRepository,
    configService: ConfigService,
  ) {
    this.userConfig = configService.get<UserConfig>(USER_CONFIG_NAME);
  }

  async createUser(
    shopId: string,
    user: CreateUserDto,
  ): Promise<UserTokensDto> {
    const existingUser = await this.getUserByEmail(shopId, user.email);
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
      shop: shopId,
    });
    return {
      access: this.generateAccessToken(newUser),
      refresh: this.generateRefreshToken(newUser),
    };
  }

  async validateUser(
    shopId: string,
    userCreds: Pick<CreateUserDto, 'email' | 'password'>,
  ): Promise<UserTokensDto> {
    const user = await this.repository.findOne({
      email: userCreds.email,
      shop: shopId,
      isActive: true,
    });
    const isPasswordValid = await bcrypt.compare(
      userCreds.password,
      user.password,
    );
    if (!isPasswordValid) {
      throw new NotFoundException('Invalid credentials');
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
      !tokenPayload.shop ||
      tokenPayload.tokenType !== UserTokenType.REFRESH_TOKEN
    ) {
      throw new UnauthorizedException(
        'Bearer token is not a valid access token',
      );
    }

    const user = await this.getUserById(tokenPayload.shop, tokenPayload.userId);
    if (!user) {
      new UnauthorizedException(
        'refresh token is not valid for requested user.',
      );
    }
    return this.generateAccessToken(user);
  }

  async getUserById(
    shopId: string,
    userId: string,
  ): Promise<LeanDocument<UserDocument> | null> {
    try {
      return await this.repository.findOne({
        shop: shopId,
        _id: userId,
        isActive: true,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        return null;
      }
      throw error;
    }
  }

  async getUserByEmail(
    shopId: string,
    email: string,
  ): Promise<LeanDocument<UserDocument> | null> {
    try {
      return await this.repository.findOne({
        shop: shopId,
        email,
        isActive: true,
      });
    } catch (error) {
      if (error instanceof NotFoundException) {
        return null;
      }
      throw error;
    }
  }

  async updateUser(
    userId: string,
    userToUpdate: UpdateUserDto,
  ): Promise<LeanDocument<UserDocument>> {
    if (!isObjectIdOrHexString(userId)) {
      throw new UnauthorizedException('Invalid userId');
    }
    console.log(userToUpdate);
    return this.repository.updateOne(
      new mongoose.Types.ObjectId(userId),
      userToUpdate,
    );
  }

  private generateAccessToken(user: LeanDocument<UserDocument>): UserTokenDto {
    const tokenPayload: UserTokenPayload = {
      tokenType: UserTokenType.ACCESS_TOKEN,
      userId: user._id.toString(),
      ..._pick(user, ['email', 'roles', 'firstName', 'lastName', 'shop']),
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
    const tokenPayload: UserTokenPayload = {
      tokenType: UserTokenType.REFRESH_TOKEN,
      userId: user._id.toString(),
      ..._pick(user, ['email', 'roles', 'firstName', 'lastName', 'shop']),
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
}
