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
import { GstResponse } from '../interfaces/gst.interface';
import { GstBaseClient } from './gst-base.client';

// Authentication archetype: establishes / refreshes / ends a taxpayer session.
// See §4.1 of docs/gst-api-mapping.md. Envelope error handling is inherited from
// GstBaseClient (GST returns HTTP 200 even for failures).
@Injectable()
export class GstAuthClient extends GstBaseClient {
  constructor(@Inject(GST_API) gstApi: AxiosInstance) {
    super(gstApi);
  }

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
}
