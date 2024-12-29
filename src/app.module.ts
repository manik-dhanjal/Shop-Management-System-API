import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import {
  DatabaseConfig,
  smsDatabaseConfig,
} from './shared/config/database.config';
import { ApiModule } from './api/api.module';
import { cloudinaryConfig } from '@config/cloudinary.config';
import { userConfig } from '@config/user.config';
import { APP_GUARD } from '@nestjs/core';
import { AuthGuard } from '@shared/gaurd/auth.gaurd';
import { UserModule } from '@api/user/user.module';

@Module({
  imports: [
    ApiModule,
    ConfigModule.forRoot({
      isGlobal: true,
      load: [smsDatabaseConfig, cloudinaryConfig, userConfig],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) =>
        configService.get<DatabaseConfig>('sms-database'),
      inject: [ConfigService],
    }),
    UserModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useClass: AuthGuard,
    },
  ],
})
export class AppModule {}
