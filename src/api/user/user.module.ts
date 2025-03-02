import { Module } from '@nestjs/common';
import { UserRepository } from './repository/user.repository';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { User, UserSchema } from './schema/user.schema';
import { EmployeeController } from './employee.controller';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
  ],
  controllers: [UserController, EmployeeController],
  providers: [UserRepository, UserService],
  exports: [UserService],
})
export class UserModule {}
