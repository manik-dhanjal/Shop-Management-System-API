import { Inject, Injectable } from '@nestjs/common';
import { AxiosInstance, AxiosResponse } from 'axios';
import { GST_API } from '../gst.constants';
import { GstBaseClient } from './gst-base.client';
import { GstResponse } from '../interfaces/gst.interface';
import { GstReturnForm } from '../enum/gst-return-form.enum';
import {
  GstFileRequest,
  GstGetSectionRequest,
  GstReturnStatusRequest,
  GstSaveRequest,
} from '../interfaces/gst-request.interface';

/**
 * Client for the GSTR return forms (GSTR-1/1A/2A/2X/3B/4/5/6/7/8/9/9A/9C, ITC-03/04).
 *
 * These forms all share the same lifecycle archetypes documented in §3–§4 of
 * docs/gst-api-mapping.md, so instead of ~200 hand-written methods this exposes one
 * method per archetype, parameterised by {@link GstReturnForm}:
 *
 *   getSection → GET  /{form}/{section}   (read saved / auto-drafted data)
 *   getSummary → GET  /{form}/retsum      (freeze + verify totals)
 *   save       → PUT  /{form}/retsave     (async, returns refId)
 *   submit     → POST /{form}/retsubmit   (lock the position)
 *   offset     → PUT  /{form}/retoffset   (set off liability)
 *   file       → POST /{form}/retfile     (DSC) or /{form}/retevcfile (EVC) → ARN
 *   reset      → POST /{form}/reset
 *   getStatus  → GET  /gstr/retstatus     (poll an async refId)
 *
 * Irregular forms (CMP-08, SPIKE, GSTR-2B) don't follow these verbs — use
 * {@link GstBaseClient.call} for those.
 */
@Injectable()
export class GstReturnsClient extends GstBaseClient {
  constructor(@Inject(GST_API) gstApi: AxiosInstance) {
    super(gstApi);
  }

  /** Read a section (b2b, cdnr, exp, …) of a saved/auto-drafted return. */
  getSection<T = unknown>(
    form: GstReturnForm,
    section: string,
    request: GstGetSectionRequest,
  ): Promise<AxiosResponse<GstResponse<T>>> {
    return this.call<T>({
      method: 'get',
      path: `/${form}/${section}`,
      session: request.session,
      gstin: request.gstin,
      retPeriod: request.retPeriod,
      params: request.params,
    });
  }

  /** Table-wise summary for the period. */
  getSummary<T = unknown>(
    form: GstReturnForm,
    request: GstGetSectionRequest,
  ): Promise<AxiosResponse<GstResponse<T>>> {
    return this.getSection<T>(form, 'retsum', request);
  }

  /** Save (overwrite) the whole form. Asynchronous — response carries a refId. */
  save<T = unknown>(
    form: GstReturnForm,
    request: GstSaveRequest,
  ): Promise<AxiosResponse<GstResponse<T>>> {
    return this.call<T>({
      method: 'put',
      path: `/${form}/retsave`,
      session: request.session,
      gstin: request.gstin,
      retPeriod: request.retPeriod,
      data: request.payload,
    });
  }

  /** Submit (freeze) the return so no further edits are possible. */
  submit<T = unknown>(
    form: GstReturnForm,
    request: GstSaveRequest,
  ): Promise<AxiosResponse<GstResponse<T>>> {
    return this.call<T>({
      method: 'post',
      path: `/${form}/retsubmit`,
      session: request.session,
      gstin: request.gstin,
      retPeriod: request.retPeriod,
      data: request.payload,
    });
  }

  /** Offset / set off liability from cash & ITC ledgers. */
  offset<T = unknown>(
    form: GstReturnForm,
    request: GstSaveRequest,
  ): Promise<AxiosResponse<GstResponse<T>>> {
    return this.call<T>({
      method: 'put',
      path: `/${form}/retoffset`,
      session: request.session,
      gstin: request.gstin,
      retPeriod: request.retPeriod,
      data: request.payload,
    });
  }

  /**
   * File the return → ARN. Uses DSC (`/retfile`) by default; pass `evcOtp` to file
   * via EVC (`/retevcfile`). `pan` is required for both.
   */
  file<T = unknown>(
    form: GstReturnForm,
    request: GstFileRequest,
  ): Promise<AxiosResponse<GstResponse<T>>> {
    const evc = Boolean(request.evcOtp);
    return this.call<T>({
      method: 'post',
      path: `/${form}/${evc ? 'retevcfile' : 'retfile'}`,
      session: request.session,
      gstin: request.gstin,
      retPeriod: request.retPeriod,
      params: { pan: request.pan, evcotp: request.evcOtp },
      data: request.payload,
    });
  }

  /** Reset a return's saved data. */
  reset<T = unknown>(
    form: GstReturnForm,
    request: GstSaveRequest,
  ): Promise<AxiosResponse<GstResponse<T>>> {
    return this.call<T>({
      method: 'post',
      path: `/${form}/reset`,
      session: request.session,
      gstin: request.gstin,
      retPeriod: request.retPeriod,
      data: request.payload,
    });
  }

  /** Poll the status of an async save/submit/offset/file by its refId. */
  getStatus<T = unknown>(
    request: GstReturnStatusRequest,
  ): Promise<AxiosResponse<GstResponse<T>>> {
    return this.call<T>({
      method: 'get',
      path: '/gstr/retstatus',
      session: request.session,
      gstin: request.gstin,
      params: {
        returnperiod: request.returnPeriod,
        refid: request.refId,
      },
    });
  }
}
