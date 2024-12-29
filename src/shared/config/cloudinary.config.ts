import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export interface CloundinaryConfig {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
}

export const CLOUDINARY_CONFIG_NAME = 'cloudinary-config';

export const cloudinaryConfig = registerAs(
  CLOUDINARY_CONFIG_NAME,
  (): CloundinaryConfig => {
    const cloudName = Joi.string()
      .required()
      .validate(process.env.CLOUDINARY_CLOUD_NAME).value;
    const apiKey = Joi.string()
      .required()
      .validate(process.env.CLOUDINARY_API_KEY).value;
    const apiSecret = Joi.string()
      .required()
      .validate(process.env.CLOUDINARY_API_SECRET).value;
    return {
      cloudName,
      apiKey,
      apiSecret,
    };
  },
);
