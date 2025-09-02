import { Injectable } from '@nestjs/common';
import { BaseGstClient } from './base-gst.client';
import {
  GstReturnData,
  Gstr1Data,
  Gstr3BData,
  Gstr4Data,
  Gstr9Data,
  Gstr9CData,
} from '../interfaces/gst-return.interface';
import {
  ReturnStatusRequest,
  ReturnSummaryRequest,
  ReturnLiabilityRequest,
  ReturnITCRequest,
} from '../interfaces/gst-request.interface';

@Injectable()
export class GstReturnClient extends BaseGstClient {
  async getReturnStatus(request: ReturnStatusRequest): Promise<any> {
    return this.get(`/returns/status/${request.gstin}`, {
      params: {
        returnPeriod: request.returnPeriod,
      },
    });
  }

  async fileGSTR1(
    gstin: string,
    returnData: GstReturnData<Gstr1Data>,
  ): Promise<any> {
    return this.post(`/returns/gstr1/${gstin}`, returnData);
  }

  async fileGSTR3B(
    gstin: string,
    returnData: GstReturnData<Gstr3BData>,
  ): Promise<any> {
    return this.post(`/returns/gstr3b/${gstin}`, returnData);
  }

  async getFiledReturns(
    gstin: string,
    returnType: string,
  ): Promise<
    GstReturnData<Gstr1Data | Gstr3BData | Gstr4Data | Gstr9Data | Gstr9CData>[]
  > {
    return this.get(`/returns/filed/${gstin}`, { params: { returnType } });
  }

  // Additional return-related methods
  async getGSTR2A(gstin: string, returnPeriod: string): Promise<any> {
    return this.get(`/returns/gstr2a/${gstin}`, { params: { returnPeriod } });
  }

  async getGSTR2B(gstin: string, returnPeriod: string): Promise<any> {
    return this.get(`/returns/gstr2b/${gstin}`, { params: { returnPeriod } });
  }

  async getGSTR4(
    gstin: string,
    returnPeriod: string,
  ): Promise<GstReturnData<Gstr4Data>> {
    return this.get(`/returns/gstr4/${gstin}`, { params: { returnPeriod } });
  }

  async getGSTR9(
    gstin: string,
    returnPeriod: string,
  ): Promise<GstReturnData<Gstr9Data>> {
    return this.get(`/returns/gstr9/${gstin}`, { params: { returnPeriod } });
  }

  async getGSTR9C(
    gstin: string,
    returnPeriod: string,
  ): Promise<GstReturnData<Gstr9CData>> {
    return this.get(`/returns/gstr9c/${gstin}`, { params: { returnPeriod } });
  }

  async getReturnSummary(request: ReturnSummaryRequest): Promise<any> {
    return this.get(`/returns/summary/${request.gstin}`, {
      params: {
        returnPeriod: request.returnPeriod,
      },
    });
  }

  async getReturnLiability(request: ReturnLiabilityRequest): Promise<any> {
    return this.get(`/returns/liability/${request.gstin}`, {
      params: {
        returnPeriod: request.returnPeriod,
      },
    });
  }

  async getReturnITC(request: ReturnITCRequest): Promise<any> {
    return this.get(`/returns/itc/${request.gstin}`, {
      params: {
        returnPeriod: request.returnPeriod,
      },
    });
  }
}
