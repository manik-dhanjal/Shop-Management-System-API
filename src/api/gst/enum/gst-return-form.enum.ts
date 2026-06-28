// Return-form module prefixes on the WhiteBooks API (the `/{form}/...` path segment).
// Used by GstReturnsClient to build endpoint paths generically. See §4 of
// docs/gst-api-mapping.md for the full per-form endpoint list.
//
// NOTE: these forms follow the regular `retsave/retsum/retsubmit/retoffset/retfile`
// convention. A few forms are irregular and are NOT listed here because their
// save/get verbs differ — reach them via GstReturnsClient.call():
//   - CMP-08  : POST /cmp/savecmp (not retsave), GET /cmp/getcmp
//   - SPIKE   : PUT  /spike/spikesave, GET /spike/rtncomplist
//   - GSTR-2B : GET  /gstr2b/all, PUT /gstr2b/gen2b
export enum GstReturnForm {
  GSTR1 = 'gstr1',
  GSTR1A = 'gstr1a',
  GSTR2A = 'gstr2a',
  GSTR2X = 'gstr2x',
  GSTR3B = 'gstr3b',
  GSTR4 = 'gstr4',
  GSTR4A = 'gstr4a',
  GSTR4_ANNUAL = 'gstr4annual',
  GSTR5 = 'gstr5',
  GSTR6 = 'gstr6',
  GSTR6A = 'gstr6a',
  GSTR7 = 'gstr7',
  GSTR8 = 'gstr8',
  GSTR9 = 'gstr9',
  GSTR9A = 'gstr9a',
  GSTR9C = 'gstr9c',
  ITC03 = 'itc03',
  ITC04 = 'itc04',
}

// Common GSTR-1 outward-supply section codes (the `get*` archetype). Other forms
// expose an overlapping subset — pass any section string to getSection().
export enum Gstr1Section {
  B2B = 'b2b',
  B2CL = 'b2cl',
  B2CS = 'b2cs',
  CDNR = 'cdnr',
  CDNUR = 'cdnur',
  EXP = 'exp',
  AT = 'at',
  TXP = 'txp',
  NIL = 'nil',
  HSN_SUMMARY = 'hsnsum',
  DOC_ISSUED = 'dociss',
  SUMMARY = 'retsum',
  // amendments
  B2BA = 'b2ba',
  B2CLA = 'b2cla',
  B2CSA = 'b2csa',
  CDNRA = 'cdnra',
  CDNURA = 'cdnura',
  EXPA = 'expa',
  ATA = 'ata',
  TXPA = 'txpa',
}
