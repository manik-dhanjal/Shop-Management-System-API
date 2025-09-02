// Auth Request Interfaces
export interface GstAuthRequest {
  gstin: string;
}

export interface GstOtpRequest extends GstAuthRequest {
  otp: string;
}

export interface GstTokenRequest extends GstOtpRequest {
  refreshToken?: string;
}

// E-way Bill Request Interfaces
export interface EwayBillRequest {
  gstin: string;
  invoiceNumber: string;
  invoiceDate: string;
  invoiceValue: number;
  supplyType: 'OUTWARD' | 'INWARD';
  transportMode: 'ROAD' | 'RAIL' | 'AIR' | 'SHIP';
  vehicleNumber?: string;
  transporterId?: string;
  transporterName?: string;
  transporterDocNo?: string;
  transporterDocDate?: string;
  fromPincode: string;
  toPincode: string;
  itemDetails: EwayBillItemDetail[];
}

export interface EwayBillItemDetail {
  itemName: string;
  hsnCode: string;
  quantity: number;
  unit: string;
  taxableValue: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  cessRate: number;
}

export interface EwayBillExtensionRequest {
  reason: string;
  newValidUpto: string;
  vehicleNumber?: string;
  transporterId?: string;
  transporterName?: string;
  transporterDocNo?: string;
  transporterDocDate?: string;
}

// Ledger Request Interfaces
export interface LedgerDateRangeRequest {
  gstin: string;
  fromDate: string;
  toDate: string;
}

export interface LedgerBalanceRequest {
  gstin: string;
  asOnDate: string;
}

export interface LedgerChallanRequest {
  gstin: string;
  challanNumber: string;
}

// Return Request Interfaces
export interface ReturnStatusRequest {
  gstin: string;
  returnPeriod: string;
}

export interface ReturnSummaryRequest extends ReturnStatusRequest {}

export interface ReturnLiabilityRequest extends ReturnStatusRequest {}

export interface ReturnITCRequest extends ReturnStatusRequest {}

// Common Request Interfaces
export interface PaginationRequest {
  page: number;
  limit: number;
}

export interface DateRangeRequest {
  fromDate: string;
  toDate: string;
}

export interface SearchRequest {
  searchTerm: string;
  searchType: 'GSTIN' | 'PAN' | 'NAME' | 'MOBILE' | 'EMAIL';
}
