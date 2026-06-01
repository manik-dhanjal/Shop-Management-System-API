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
