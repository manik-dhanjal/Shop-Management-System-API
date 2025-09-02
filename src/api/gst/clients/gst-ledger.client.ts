import { Injectable } from '@nestjs/common';
import { BaseGstClient } from './base-gst.client';
import {
  LedgerDateRangeRequest,
  LedgerBalanceRequest,
  LedgerChallanRequest,
} from '../interfaces/gst-request.interface';

@Injectable()
export class GstLedgerClient extends BaseGstClient {
  async getCashLedger(request: LedgerDateRangeRequest): Promise<any> {
    return this.get(`/ledger/cash/${request.gstin}`, {
      params: {
        fromDate: request.fromDate,
        toDate: request.toDate,
      },
    });
  }

  async getCreditLedger(request: LedgerDateRangeRequest): Promise<any> {
    return this.get(`/ledger/credit/${request.gstin}`, {
      params: {
        fromDate: request.fromDate,
        toDate: request.toDate,
      },
    });
  }

  async getLiabilityLedger(request: LedgerDateRangeRequest): Promise<any> {
    return this.get(`/ledger/liability/${request.gstin}`, {
      params: {
        fromDate: request.fromDate,
        toDate: request.toDate,
      },
    });
  }

  // Additional ledger-related methods
  async getLedgerSummary(request: LedgerDateRangeRequest): Promise<any> {
    return this.get(`/ledger/summary/${request.gstin}`, {
      params: {
        fromDate: request.fromDate,
        toDate: request.toDate,
      },
    });
  }

  async getLedgerTransactions(request: LedgerDateRangeRequest): Promise<any> {
    return this.get(`/ledger/transactions/${request.gstin}`, {
      params: {
        fromDate: request.fromDate,
        toDate: request.toDate,
      },
    });
  }

  async getLedgerBalance(request: LedgerBalanceRequest): Promise<any> {
    return this.get(`/ledger/balance/${request.gstin}`, {
      params: {
        asOnDate: request.asOnDate,
      },
    });
  }

  async getLedgerReconciliation(request: LedgerDateRangeRequest): Promise<any> {
    return this.get(`/ledger/reconciliation/${request.gstin}`, {
      params: {
        fromDate: request.fromDate,
        toDate: request.toDate,
      },
    });
  }

  async getLedgerStatement(request: LedgerDateRangeRequest): Promise<any> {
    return this.get(`/ledger/statement/${request.gstin}`, {
      params: {
        fromDate: request.fromDate,
        toDate: request.toDate,
      },
    });
  }

  async getLedgerChallan(request: LedgerChallanRequest): Promise<any> {
    return this.get(
      `/ledger/challan/${request.gstin}/${request.challanNumber}`,
    );
  }
}
