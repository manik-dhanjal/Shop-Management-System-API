import { Injectable } from '@nestjs/common';
import { BaseGstClient } from './base-gst.client';
import {
  EwayBillRequest,
  EwayBillExtensionRequest,
  DateRangeRequest,
} from '../interfaces/gst-request.interface';

@Injectable()
export class GstEwayBillClient extends BaseGstClient {
  async generateEwayBill(request: EwayBillRequest): Promise<any> {
    return this.post('/eway-bill/generate', request);
  }

  async getEwayBill(ewbNumber: string): Promise<any> {
    return this.get(`/eway-bill/${ewbNumber}`);
  }

  async cancelEwayBill(ewbNumber: string, reason: string): Promise<any> {
    return this.post(`/eway-bill/cancel/${ewbNumber}`, { reason });
  }

  async extendEwayBill(
    ewbNumber: string,
    request: EwayBillExtensionRequest,
  ): Promise<any> {
    return this.post(`/eway-bill/extend/${ewbNumber}`, request);
  }

  // Additional e-way bill methods
  async getEwayBillList(
    gstin: string,
    dateRange: DateRangeRequest,
  ): Promise<any> {
    return this.get(`/eway-bill/list/${gstin}`, { params: dateRange });
  }

  async getEwayBillStatus(ewbNumber: string): Promise<any> {
    return this.get(`/eway-bill/status/${ewbNumber}`);
  }

  async getEwayBillHistory(ewbNumber: string): Promise<any> {
    return this.get(`/eway-bill/history/${ewbNumber}`);
  }

  async getEwayBillPartA(ewbNumber: string): Promise<any> {
    return this.get(`/eway-bill/part-a/${ewbNumber}`);
  }

  async getEwayBillPartB(ewbNumber: string): Promise<any> {
    return this.get(`/eway-bill/part-b/${ewbNumber}`);
  }

  async updateEwayBillPartB(
    ewbNumber: string,
    request: EwayBillRequest,
  ): Promise<any> {
    return this.post(`/eway-bill/part-b/${ewbNumber}`, request);
  }

  async getEwayBillPrint(ewbNumber: string): Promise<any> {
    return this.get(`/eway-bill/print/${ewbNumber}`);
  }

  async getEwayBillQRCode(ewbNumber: string): Promise<any> {
    return this.get(`/eway-bill/qr/${ewbNumber}`);
  }
}
