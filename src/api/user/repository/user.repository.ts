import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { CoreRepository } from '@core/core.repository';
import { Model } from 'mongoose';
import { User, UserDocument } from '../schema/user.schema';

@Injectable()
export class UserRepository extends CoreRepository<UserDocument> {
  constructor(
    @InjectModel(User.name)
    readonly model: Model<UserDocument>,
  ) {
    super(model);
  }
}
