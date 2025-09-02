export interface GstAddress {
  bnm: string;
  st: string;
  loc: string;
  bno: string;
  dst: string;
  lt: string;
  locality: string;
  pncd: string;
  landMark: string;
  stcd: string;
  geocodelvl: string;
  flno: string;
  lg: string;
}

export interface GstPrincipalAddress {
  addr: GstAddress;
  ntr: string;
}

export interface GstPublicSearchTaxpayerResponse {
  data: {
    stjCd: string;
    lgnm: string;
    stj: string;
    dty: string;
    adadr: any[]; // Additional addresses, structure not provided
    cxdt: string;
    gstin: string;
    nba: string[];
    lstupdt: string;
    rgdt: string;
    ctb: string;
    pradr: GstPrincipalAddress;
    ctjCd: string;
    tradeNam: string;
    sts: string;
    ctj: string;
    einvoiceStatus: string;
  };
  status_cd: string;
  status_desc: string;
}
