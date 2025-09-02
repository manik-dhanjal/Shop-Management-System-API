export interface GstReturnData<
  T extends Gstr1Data | Gstr3BData | Gstr4Data | Gstr9Data | Gstr9CData,
> {
  gstin: string;
  returnPeriod: string;
  returnType: string;
  filingStatus: string;
  data: T;
}

export interface B2BInvoice {
  invoiceNumber: string;
  invoiceDate: string;
  customerGstin: string;
  customerName: string;
  customerState: string;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  totalAmount: number;
}

export interface B2CLInvoice {
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  customerState: string;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  totalAmount: number;
}

export interface B2CSInvoice {
  invoiceNumber: string;
  invoiceDate: string;
  customerState: string;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  totalAmount: number;
}

export interface CreditDebitNote {
  noteNumber: string;
  noteDate: string;
  originalInvoiceNumber: string;
  originalInvoiceDate: string;
  customerGstin: string;
  customerName: string;
  customerState: string;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  totalAmount: number;
  noteType: 'CREDIT' | 'DEBIT';
}

export interface CreditDebitNoteUnregistered {
  noteNumber: string;
  noteDate: string;
  originalInvoiceNumber: string;
  originalInvoiceDate: string;
  customerName: string;
  customerState: string;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  totalAmount: number;
  noteType: 'CREDIT' | 'DEBIT';
}

export interface ExportInvoice {
  invoiceNumber: string;
  invoiceDate: string;
  customerName: string;
  customerCountry: string;
  taxableValue: number;
  igst: number;
  cess: number;
  totalAmount: number;
  shippingBillNumber: string;
  shippingBillDate: string;
  portCode: string;
}

export interface AdvanceTax {
  receiptNumber: string;
  receiptDate: string;
  customerGstin: string;
  customerName: string;
  customerState: string;
  taxableValue: number;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  totalAmount: number;
}

export interface TaxPaid {
  challanNumber: string;
  challanDate: string;
  taxPeriod: string;
  cgst: number;
  sgst: number;
  igst: number;
  cess: number;
  totalAmount: number;
}

export interface Gstr1Data {
  b2bInvoices: B2BInvoice[];
  b2clInvoices: B2CLInvoice[];
  b2csInvoices: B2CSInvoice[];
  creditDebitNotes: CreditDebitNote[];
  creditDebitNotesUnregistered: CreditDebitNoteUnregistered[];
  exportInvoices: ExportInvoice[];
  advanceTax: AdvanceTax[];
  taxPaid: TaxPaid[];
}

export interface Gstr3BData {
  gstin: string;
  returnPeriod: string;
  outwardSupplies: {
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
    cess: number;
  };
  inwardSupplies: {
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
    cess: number;
  };
  itc: {
    cgst: number;
    sgst: number;
    igst: number;
    cess: number;
  };
  taxLiability: {
    cgst: number;
    sgst: number;
    igst: number;
    cess: number;
  };
  taxPaid: {
    cgst: number;
    sgst: number;
    igst: number;
    cess: number;
  };
}

export interface Gstr4Data {
  gstin: string;
  returnPeriod: string;
  outwardSupplies: {
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
    cess: number;
  };
  inwardSupplies: {
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
    cess: number;
  };
  taxLiability: {
    cgst: number;
    sgst: number;
    igst: number;
    cess: number;
  };
  taxPaid: {
    cgst: number;
    sgst: number;
    igst: number;
    cess: number;
  };
}

export interface Gstr9Data {
  gstin: string;
  returnPeriod: string;
  outwardSupplies: {
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
    cess: number;
  };
  inwardSupplies: {
    taxableValue: number;
    cgst: number;
    sgst: number;
    igst: number;
    cess: number;
  };
  itc: {
    cgst: number;
    sgst: number;
    igst: number;
    cess: number;
  };
  taxLiability: {
    cgst: number;
    sgst: number;
    igst: number;
    cess: number;
  };
  taxPaid: {
    cgst: number;
    sgst: number;
    igst: number;
    cess: number;
  };
  reconciliation: {
    outwardSupplies: {
      taxableValue: number;
      cgst: number;
      sgst: number;
      igst: number;
      cess: number;
    };
    inwardSupplies: {
      taxableValue: number;
      cgst: number;
      sgst: number;
      igst: number;
      cess: number;
    };
    itc: {
      cgst: number;
      sgst: number;
      igst: number;
      cess: number;
    };
  };
}

export interface Gstr9CData {
  gstin: string;
  returnPeriod: string;
  reconciliation: {
    outwardSupplies: {
      taxableValue: number;
      cgst: number;
      sgst: number;
      igst: number;
      cess: number;
    };
    inwardSupplies: {
      taxableValue: number;
      cgst: number;
      sgst: number;
      igst: number;
      cess: number;
    };
    itc: {
      cgst: number;
      sgst: number;
      igst: number;
      cess: number;
    };
  };
  auditReport: {
    auditorName: string;
    auditorGstin: string;
    auditDate: string;
    auditRemarks: string;
  };
}
