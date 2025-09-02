import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { GST_CONFIG_NAME, GstConfig } from '../../../shared/config/gst.config';

@Injectable()
export class BaseGstClient {
  protected readonly client: AxiosInstance;

  constructor(readonly configService: ConfigService) {
    const config = this.configService.get<GstConfig>(GST_CONFIG_NAME);

    this.client = axios.create({
      baseURL: config.baseUrl,
      timeout: config.timeout,
      headers: {
        'Content-Type': 'application/json',
        client_id: config.clientId,
        client_secret: config.clientSecret,
      },
    });
  }

  protected async get<T>(
    url: string,
    config?: AxiosRequestConfig<T>,
  ): Promise<T> {
    const response = await this.client.get<T>(url, config);
    return response.data;
  }

  protected async post<ResponseDataT, RequestDataT = Record<string, unknown>>(
    url: string,
    data?: RequestDataT,
    config?: AxiosRequestConfig<RequestDataT>,
  ): Promise<ResponseDataT> {
    const response = await this.client.post<ResponseDataT>(url, data, config);
    return response.data;
  }
}
