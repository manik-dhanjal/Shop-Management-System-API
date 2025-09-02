import { registerAs } from '@nestjs/config';
import * as Joi from 'joi';

export interface GstConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  ipAddress: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
}

export const GST_CONFIG_NAME = 'gst-config';

export const gstConfig = registerAs(GST_CONFIG_NAME, (): GstConfig => {
  const baseUrl = Joi.string()
    .required()
    .uri()
    .description('Base URL for GST API endpoints')
    .validate(process.env.GST_BASE_URL).value;

  const clientId = Joi.string()
    .required()
    .min(3)
    .max(50)
    .description('Client ID for GST API authentication')
    .validate(process.env.GST_CLIENT_ID).value;

  const clientSecret = Joi.string()
    .required()
    .min(8)
    .max(100)
    .description('Client secret for GST API authentication')
    .validate(process.env.GST_CLIENT_SECRET).value;

  const ipAddress = Joi.string()
    .ip()
    .required()
    .description('IP address for GST API requests')
    .validate(process.env.GST_IP_ADDRESS).value;

  const timeout = Joi.number()
    .default(30000)
    .min(1000)
    .max(120000)
    .description('Timeout in milliseconds for GST API requests')
    .validate(process.env.GST_TIMEOUT).value;

  const retryAttempts = Joi.number()
    .default(3)
    .min(1)
    .max(5)
    .description('Number of retry attempts for failed GST API requests')
    .validate(process.env.GST_RETRY_ATTEMPTS).value;

  const retryDelay = Joi.number()
    .default(1000)
    .min(100)
    .max(5000)
    .description('Delay in milliseconds between retry attempts')
    .validate(process.env.GST_RETRY_DELAY).value;

  return {
    baseUrl,
    clientId,
    clientSecret,
    ipAddress,
    timeout,
    retryAttempts,
    retryDelay,
  };
});
