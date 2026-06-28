import { GSTRequestHeaders } from './gst.interface';

// Auth Request Interfaces
export interface GstSendOtpRequest
  extends Omit<GSTRequestHeaders, 'transactionId'> {
  email: string;
}

export interface GstValidateOtpRequest extends GSTRequestHeaders {
  email: string;
  otp: string;
}

export interface GstTokenRequest extends GSTRequestHeaders {
  email: string;
}

export interface GstLogoutRequest extends GSTRequestHeaders {
  email: string;
}

export interface GstSendEvcOtpRequest extends GSTRequestHeaders {
  email: string; //(Required) User Email
  gstin: string; //(Required) GSTIN of the taxpayer
  pan: string; //(Required) Pan number of the authorised signatory
  formType: string; //(Required) Form Number
}

// ---------------------------------------------------------------------------
// Data-call request interfaces (returns, public, ledger). See docs/gst-api-mapping.md.
// ---------------------------------------------------------------------------

// An authenticated taxpayer session: the auth-token transaction id obtained from
// GstAuthClient.getAuthToken plus the identity used to mint it. Carried on every
// data call (archetypes C–H in the mapping doc).
export interface GstSession extends GSTRequestHeaders {
  email: string; // WhiteBooks-registered caller email (sent as the `email` query param)
}

// A loose query-param bag. `undefined`/empty values are dropped before the call.
export type GstQueryParams = Record<
  string,
  string | number | boolean | undefined
>;

// Low-level options accepted by GstBaseClient.call — lets any of the 247
// endpoints be reached even when there is no typed convenience wrapper for it.
export interface GstCallOptions {
  method: 'get' | 'put' | 'post';
  path: string; // e.g. "/gstr1/b2b"
  session: GstSession;
  gstin?: string; // routed to query on GET, to header on PUT/POST (per the spec)
  retPeriod?: string; // MMYYYY — query `retperiod` on GET, header `ret_period` on writes
  params?: GstQueryParams; // extra call-specific query params (ctin, fromtime, pan, evcotp…)
  data?: unknown; // JSON body for writes
}

// Context shared by every return-form call.
export interface GstReturnContext {
  session: GstSession;
  gstin: string;
  retPeriod: string; // MMYYYY
}

// GET a section of a saved/auto-drafted return (b2b, cdnr, retsum, …).
export interface GstGetSectionRequest extends GstReturnContext {
  params?: GstQueryParams; // ctin, fromtime, actionrequired, statecd, smrytyp, …
}

// PUT save / PUT offset — body carries the GSTN form JSON.
export interface GstSaveRequest extends GstReturnContext {
  payload: Record<string, unknown>;
}

// POST file (DSC). For EVC filing, also pass `evcOtp`.
export interface GstFileRequest extends GstReturnContext {
  pan: string;
  payload: Record<string, unknown>;
  evcOtp?: string;
}

// Poll an async refId via /gstr/retstatus.
export interface GstReturnStatusRequest {
  session: GstSession;
  gstin: string;
  returnPeriod: string;
  refId: string;
}

// Public (no taxpayer session required beyond ASP credentials).
export interface GstSearchTaxpayerRequest {
  session: GstSession;
  gstin: string;
}

export interface GstTrackReturnsRequest {
  session: GstSession;
  gstin: string;
  fy: string; // financial year, YYYY-YY
  type?: string; // optional return type filter
}

// Electronic ledger pulls. Most use a date range (ddmmyyyy); balance uses a period.
export interface GstLedgerRequest {
  session: GstSession;
  gstin: string;
  fromDate?: string; // ddmmyyyy
  toDate?: string; // ddmmyyyy
  retPeriod?: string; // MMYYYY (for balance / liability)
}
