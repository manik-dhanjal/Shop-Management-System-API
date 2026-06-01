// Injection tokens for the GST HTTP clients. Kept in a dependency-free leaf
// module so clients can import them without creating a circular import with
// gst.module.ts (which imports the clients).
export const GST_API = 'GST_API';
export const E_INVOICE_API = 'E_INVOICE_API';
export const E_WAY_BILL_API = 'E_WAY_BILL_API';
