import { Inject, Injectable } from '@nestjs/common';
import { AxiosInstance, AxiosResponse } from 'axios';
import { GST_API } from '../gst.constants';
import { GstBaseClient } from './gst-base.client';
import { GstResponse } from '../interfaces/gst.interface';
import { GstLedgerRequest } from '../interfaces/gst-request.interface';

/**
 * Electronic ledger pulls — cash / ITC / liability ledgers and balances.
 * Date-range pulls use `fromDate`/`toDate` (ddmmyyyy); balance/liability use
 * `retPeriod`. See §4.5 of docs/gst-api-mapping.md.
 */
@Injectable()
export class GstLedgerClient extends GstBaseClient {
  constructor(@Inject(GST_API) gstApi: AxiosInstance) {
    super(gstApi);
  }

  /** Detailed cash ledger for a date range. */
  getCashLedger<T = unknown>(request: GstLedgerRequest) {
    return this.range<T>('/ledgers/cashdtl', request);
  }

  /** Detailed ITC ledger for a date range. */
  getItcLedger<T = unknown>(request: GstLedgerRequest) {
    return this.range<T>('/ledgers/itc', request);
  }

  /** Tax / liability ledger for a date range. */
  getTaxLedger<T = unknown>(request: GstLedgerRequest) {
    return this.range<T>('/ledgers/tax', request);
  }

  /** Cash & ITC balance as on date (uses `retPeriod`). */
  getBalance<T = unknown>(
    request: GstLedgerRequest,
  ): Promise<AxiosResponse<GstResponse<T>>> {
    return this.call<T>({
      method: 'get',
      path: '/ledgers/bal',
      session: request.session,
      gstin: request.gstin,
      params: { retperiod: request.retPeriod },
    });
  }

  private range<T>(
    path: string,
    request: GstLedgerRequest,
  ): Promise<AxiosResponse<GstResponse<T>>> {
    return this.call<T>({
      method: 'get',
      path,
      session: request.session,
      gstin: request.gstin,
      params: { frdt: request.fromDate, todt: request.toDate },
    });
  }
}
