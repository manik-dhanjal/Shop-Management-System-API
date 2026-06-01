import { Inject, Injectable } from '@nestjs/common';
import {
  GstSendOtpRequest,
  GstLogoutRequest,
  GstTokenRequest,
  GstValidateOtpRequest,
  GstSendEvcOtpRequest,
} from '../interfaces/gst-request.interface';
import { AxiosInstance, AxiosResponse } from 'axios';
import { GST_API } from '../gst.constants';
import { GstRequestFailedException } from '../exceptions/gst-request-failed.exception';
import { GstResponse } from '../interfaces/gst.interface';

@Injectable()
export class GstAuthClient {
  constructor(
    @Inject(GST_API)
    private readonly gstApi: AxiosInstance,
  ) {}

  // send OTP to gst user with email and gst username
  async sendOtp(
    request: GstSendOtpRequest,
  ): Promise<AxiosResponse<GstResponse>> {
    const response = await this.gstApi.get('/authentication/otprequest', {
      params: {
        email: request.email,
      },
      headers: {
        gst_username: request.gstUsername,
        state_cd: request.stateCode,
      },
    });
    this.handleError(response);
    return response;
  }

  // validate OTP and get auth token for gst user
  async getAuthToken(
    request: GstValidateOtpRequest,
  ): Promise<AxiosResponse<GstResponse>> {
    const response = await this.gstApi.get('/authentication/authtoken', {
      params: { email: request.email, otp: request.otp },
      headers: {
        gst_username: request.gstUsername,
        state_cd: request.stateCode,
        txn: request.transactionId,
      },
    });
    this.handleError(response);
    return response;
  }

  // refresh auth token for gst user
  async refreshToken(
    request: GstTokenRequest,
  ): Promise<AxiosResponse<GstResponse>> {
    const response = await this.gstApi.get('/authentication/refreshtoken', {
      params: { email: request.email },
      headers: {
        gst_username: request.gstUsername,
        state_cd: request.stateCode,
        txn: request.transactionId,
      },
    });
    this.handleError(response);
    return response;
  }

  // logout gst user and invalidate auth token
  async logout(request: GstLogoutRequest): Promise<AxiosResponse<GstResponse>> {
    const response = await this.gstApi.get('/authentication/logout', {
      params: { email: request.email },
      headers: {
        gst_username: request.gstUsername,
        state_cd: request.stateCode,
        txn: request.transactionId,
      },
    });
    this.handleError(response);
    return response;
  }

  // send EVC OTP for GST user
  async sendEvcOtp(
    request: GstSendEvcOtpRequest,
  ): Promise<AxiosResponse<GstResponse>> {
    const response = await this.gstApi.get('/authentication/otpforevc', {
      params: {
        email: request.email,
        gstin: request.gstin,
        pan: request.pan,
        form_type: request.formType,
      },
      headers: {
        gst_username: request.gstUsername,
        state_cd: request.stateCode,
        txn: request.transactionId,
      },
    });
    this.handleError(response);
    return response;
  }

  // Common method to handle errors in GST API responses
  // because GST API returns 200 status code even for failed requests
  // and error details are present in response body
  handleError(response: AxiosResponse<GstResponse>): void {
    if (response.data.error || response.data.status_cd === '0') {
      throw new GstRequestFailedException(
        response.data.error?.message || response.data.status_desc,
        response,
      );
    }
  }
}
