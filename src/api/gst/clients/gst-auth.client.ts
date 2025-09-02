import { Injectable } from '@nestjs/common';
import { BaseGstClient } from './base-gst.client';
import {
  GstAuthRequest,
  GstOtpRequest,
  GstTokenRequest,
} from '../interfaces/gst-request.interface';

@Injectable()
export class GstAuthClient extends BaseGstClient {
  async getOtp(request: GstAuthRequest): Promise<any> {
    return this.post('/auth/otp', request);
  }

  async validateOtp(request: GstOtpRequest): Promise<any> {
    return this.post('/auth/validate-otp', request);
  }

  async getAuthToken(request: GstOtpRequest): Promise<any> {
    return this.post('/auth/token', request);
  }

  // Additional authentication methods
  async refreshToken(request: GstTokenRequest): Promise<any> {
    return this.post('/auth/refresh-token', request);
  }

  async logout(token: string): Promise<any> {
    return this.post('/auth/logout', { token });
  }

  async validateToken(token: string): Promise<any> {
    return this.post('/auth/validate-token', { token });
  }

  async getGstinDetails(gstin: string): Promise<any> {
    return this.get(`/auth/gstin/${gstin}`);
  }
}
