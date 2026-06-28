import { AxiosInstance, AxiosResponse } from 'axios';
import { GstRequestFailedException } from '../exceptions/gst-request-failed.exception';
import { GstResponse } from '../interfaces/gst.interface';
import {
  GstCallOptions,
  GstQueryParams,
} from '../interfaces/gst-request.interface';

/**
 * Shared foundation for every WhiteBooks API client.
 *
 * It centralises the three things every call needs:
 *  1. the standard taxpayer-session headers (gst_username / state_cd / txn) — the
 *     ip_address / client_id / client_secret headers are baked into the GST_API
 *     axios instance (see gst.module.ts);
 *  2. the GET-vs-write routing of `gstin` / `ret_period` (query on GET, headers on
 *     PUT/POST — matching the WhiteBooks OpenAPI spec); and
 *  3. error handling for the WhiteBooks envelope, which returns HTTP 200 even on
 *     failure (the real status is `status_cd` / `error`).
 *
 * Concrete clients inject GST_API and pass it up via super(gstApi). Anything that
 * lacks a typed wrapper can still be reached through {@link call}.
 */
export abstract class GstBaseClient {
  protected constructor(protected readonly gstApi: AxiosInstance) {}

  /**
   * Low-level escape hatch: invoke any WhiteBooks endpoint. Builds the query/header
   * split, drops empty params, fires the request and runs envelope error handling.
   */
  async call<T = unknown>(
    options: GstCallOptions,
  ): Promise<AxiosResponse<GstResponse<T>>> {
    const { method, path, session, gstin, retPeriod, params, data } = options;

    const query: GstQueryParams = {
      email: session.email,
      ...this.clean(params),
    };
    const headers: Record<string, string> = {
      gst_username: session.gstUsername,
      state_cd: session.stateCode,
    };
    if (session.transactionId) headers.txn = session.transactionId;

    // GET reads carry gstin/retperiod as query params; writes carry them as headers.
    if (method === 'get') {
      if (gstin) query.gstin = gstin;
      if (retPeriod) query.retperiod = retPeriod;
    } else {
      if (gstin) headers.gstin = gstin;
      if (retPeriod) headers.ret_period = retPeriod;
    }

    const response = await this.gstApi.request<GstResponse<T>>({
      method,
      url: path,
      params: query,
      headers,
      data,
    });
    this.handleError(response);
    return response;
  }

  // Drop undefined / empty-string params so axios doesn't serialise `?ctin=`.
  private clean(params?: GstQueryParams): GstQueryParams {
    if (!params) return {};
    return Object.fromEntries(
      Object.entries(params).filter(
        ([, value]) => value !== undefined && value !== '',
      ),
    );
  }

  /**
   * WhiteBooks/GSTN return HTTP 200 even for failed requests, with the real outcome
   * in the body. Treat `status_cd === '0'` or a populated `error` as a failure.
   */
  protected handleError(response: AxiosResponse<GstResponse>): void {
    if (response.data?.error || response.data?.status_cd === '0') {
      throw new GstRequestFailedException(
        response.data.error?.message ||
          response.data.status_desc ||
          'GST request failed',
        response,
      );
    }
  }
}
