import { Inject, Injectable } from '@nestjs/common';
import { AxiosInstance, AxiosResponse } from 'axios';
import { GST_API } from '../gst.constants';
import { GstBaseClient } from './gst-base.client';
import { GstResponse } from '../interfaces/gst.interface';
import {
  GstSearchTaxpayerRequest,
  GstTrackReturnsRequest,
} from '../interfaces/gst-request.interface';

// Shape of the taxpayer profile returned by /public/search (subset).
export interface GstTaxpayerDetails {
  gstin?: string;
  lgnm?: string; // legal name
  tradeNam?: string; // trade name
  sts?: string; // registration status (e.g. "Active")
  ctb?: string; // constitution of business
  rgdt?: string; // registration date
  dty?: string; // dealer type
  [key: string]: unknown;
}

/**
 * Public (no-session) WhiteBooks endpoints — only the ASP client credentials baked
 * into GST_API are required. The headline use case for this app is GSTIN
 * verification via {@link searchTaxpayer}. See §4.1 of docs/gst-api-mapping.md.
 */
@Injectable()
export class GstPublicClient extends GstBaseClient {
  constructor(@Inject(GST_API) gstApi: AxiosInstance) {
    super(gstApi);
  }

  /** Search taxpayer details by GSTIN (GSTIN verification / autofill). */
  searchTaxpayer(
    request: GstSearchTaxpayerRequest,
  ): Promise<AxiosResponse<GstResponse<GstTaxpayerDetails>>> {
    return this.call<GstTaxpayerDetails>({
      method: 'get',
      path: '/public/search',
      session: request.session,
      gstin: request.gstin,
    });
  }

  /** View & track the return-filing status for a GSTIN / financial year. */
  trackReturns<T = unknown>(
    request: GstTrackReturnsRequest,
  ): Promise<AxiosResponse<GstResponse<T>>> {
    return this.call<T>({
      method: 'get',
      path: '/public/rettrack',
      session: request.session,
      gstin: request.gstin,
      params: { fy: request.fy, type: request.type },
    });
  }

  /** Get the QRMP/monthly filing preference for a GSTIN / financial year. */
  getPreference<T = unknown>(
    request: GstTrackReturnsRequest,
  ): Promise<AxiosResponse<GstResponse<T>>> {
    return this.call<T>({
      method: 'get',
      path: '/public/pref',
      session: request.session,
      gstin: request.gstin,
      params: { fy: request.fy },
    });
  }
}
