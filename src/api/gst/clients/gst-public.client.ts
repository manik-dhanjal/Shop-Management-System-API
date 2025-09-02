import { Injectable } from '@nestjs/common';
import { BaseGstClient } from './base-gst.client';
import { ConfigService } from '@nestjs/config';
import { GST_CONFIG_NAME, GstConfig } from '@config/gst.config';

@Injectable()
export class GSTPublicClient extends BaseGstClient {
  constructor(configService: ConfigService) {
    super(configService);
  }
  /**
   * Search taxpayer details by GSTIN and email.
   */
  async searchTaxpayer(gstin: string, email: string) {
    return this.get<any>('/public/search', {
      params: {
        email: encodeURIComponent(email),
        gstin: encodeURIComponent(gstin),
      },
    });
  }

  /**
   * View and track Returns status.
   */
  async viewAndTrackReturns(
    gstin: string,
    fy: string,
    type: string,
    email: string,
  ) {
    return this.get<any>('/public/rettrack', {
      params: {
        gstin: encodeURIComponent(gstin),
        fy: encodeURIComponent(fy),
        type: encodeURIComponent(type),
        email: encodeURIComponent(email),
      },
    });
  }

  /**
   * Get Preference.
   */
  async getPreference(
    gstin: string,
    fy: string,
    email: string,
    stateCd: string,
  ) {
    const { ipAddress } = this.configService.get<GstConfig>(GST_CONFIG_NAME);

    if (!ipAddress) {
      throw new Error('IP address is not configured in GST settings');
    }
    // These headers are required as per postman collection
    return this.get<any>('/public/pref', {
      params: {
        gstin: encodeURIComponent(gstin),
        fy: encodeURIComponent(fy),
        email: encodeURIComponent(email),
      },
      headers: {
        'state-cd': stateCd,
        'ip-adr': ipAddress,
      },
    });
  }

  /**
   * Fetch details of the URD for e-commerce supplier.
   */
  async getUnregisteredApplicants(uid: string, email: string, ipAddr: string) {
    const { ipAddress } = this.configService.get<GstConfig>(GST_CONFIG_NAME);
    if (!ipAddress) {
      throw new Error('IP address is not configured in GST settings');
    }
    return this.get<any>('/public/unregistered-applicants', {
      params: {
        uid: encodeURIComponent(uid),
        email: encodeURIComponent(email),
      },
      headers: {
        'ip-adr': ipAddress,
      },
    });
  }

  /**
   * Validate Mobile Number and Email Address of unregistered applicants.
   */
  async validateUnregisteredApplicants(
    uid: string,
    ecomEmail: string,
    mobile: string,
    email: string,
  ) {
    const { ipAddress } = this.configService.get<GstConfig>(GST_CONFIG_NAME);
    if (!ipAddress) {
      throw new Error('IP address is not configured in GST settings');
    }
    return this.get<any>('/public/unregistered-applicants-validation', {
      params: {
        uid: encodeURIComponent(uid),
        ecomEmail: encodeURIComponent(ecomEmail),
        mobile: encodeURIComponent(mobile),
        email: encodeURIComponent(email),
      },
      headers: {
        'ip-adr': ipAddress,
      },
    });
  }
}
