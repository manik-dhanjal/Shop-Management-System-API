import { AxiosResponse } from 'axios';

export class GstRequestFailedException extends Error {
  private responseData?: AxiosResponse<unknown>;
  constructor(message: string, responseData?: AxiosResponse<unknown>) {
    super(message);
    this.name = 'GstRequestFailedException';
    this.responseData = responseData;
  }
}
