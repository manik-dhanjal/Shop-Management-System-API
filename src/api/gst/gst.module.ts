import { Module } from '@nestjs/common';
import { GstAuthClient } from './clients/gst-auth.client';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import { GST_CONFIG_NAME, GstConfig } from '@config/gst.config';
import { GST_API } from './gst.constants';

export { GST_API, E_INVOICE_API, E_WAY_BILL_API } from './gst.constants';

export const HttpProviders = [
  {
    provide: GST_API,
    useFactory: (configService: ConfigService): AxiosInstance => {
      const config = configService.getOrThrow<GstConfig>(GST_CONFIG_NAME);

      return axios.create({
        baseURL: config.baseUrl,
        timeout: config.timeout,
        headers: {
          'Content-Type': 'application/json',
          ip_address: config.ipAddress,
          client_id: config.clientId,
          client_secret: config.clientSecret,
        },
      });
    },
    inject: [ConfigService],
  },
  //TODO: create the config services for each provider and update the headers and baseURL accordingly
  // {
  //   provide: E_INVOICE_API,
  //   useFactory: (configService: ConfigService): AxiosInstance => {
  //     const config = configService.getOrThrow<GstConfig>(GST_CONFIG_NAME);

  //     return axios.create({
  //       baseURL: `${config.baseUrl}/einvoice`,
  //       timeout: config.timeout,
  //       headers: {
  //         'Content-Type': 'application/json',
  //         client_id: config.clientId,
  //         client_secret: config.clientSecret,
  //       },
  //     });
  //   },
  //   inject: [ConfigService],
  // },

  // {
  //   provide: E_WAY_BILL_API,
  //   useFactory: (configService: ConfigService): AxiosInstance => {
  //     const config = configService.getOrThrow<GstConfig>(GST_CONFIG_NAME);

  //     return axios.create({
  //       baseURL: `${config.baseUrl}/ewaybill`,
  //       timeout: config.timeout,
  //       headers: {
  //         'Content-Type': 'application/json',
  //         client_id: config.clientId,
  //         client_secret: config.clientSecret,
  //       },
  //     });
  //   },
  //   inject: [ConfigService],
  // },
];

@Module({
  providers: [GstAuthClient, ...HttpProviders],
  exports: [GstAuthClient, ...HttpProviders],
})
export class GstModule {}
