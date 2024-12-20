import * as Joi from 'joi';
import { registerAs } from '@nestjs/config';
import { MongooseOptionsFactory } from '@nestjs/mongoose';

export interface DatabaseConfig {
  uri: string;
  useNewUrlParser: boolean;
  useUnifiedTopology: boolean;
  config: MongooseOptionsFactory;
}

export const smsDatabaseConfig = registerAs('sms-database', () => {
  const smsDbUrlValidation = Joi.string().uri().required();
  const smsDbUrl = smsDbUrlValidation.validate(process.env.SMS_DB_URL).value;
  const mongoLoggerLevelValidation = Joi.string().default('info');
  const mongoLoggerLevel = mongoLoggerLevelValidation.validate(
    process.env.MONGO_LOGGER_LEVEL,
  ).value;
  return {
    uri: smsDbUrl,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    config: {
      autoIndex: false,
      loggerLevel: mongoLoggerLevel,
      toObject: {
        getters: true,
        virtuals: true,
        transform: true,
        flattenDecimals: true,
      },
      toJSON: {
        getters: true,
        virtuals: true,
        transform: true,
        flattenDecimals: true,
      },
    },
  };
});
