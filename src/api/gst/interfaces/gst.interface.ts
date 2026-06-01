// GST API Common request payload which will be added in headers of all GST API requests
export interface GSTRequestHeaders {
  gstUsername: string; // GST username (usually the primary email associated with the GSTIN) ex-> "TN_NT2.152384"
  stateCode: string; // Added state code from gstin prefix ex-> "27" for Maharashtra
  transactionId: string; // Transaction ID for the request ex-> "0c67ea4c495040cfa0831991d36f1ab7"
}

// Common error response interfaces for GST API responses
export interface GSTErrorResponse {
  message: string; // Description of the error ex-> "user name exists"
  error_cd: string; // GST API error code Reference: https://developer.whitebooks.in/static/whitebooks/GST-API-Error-Codes.docx ex-> "AUTH4033"
}

// Common header response interfaces for GST API responses
export interface GSTHeaderResponse {
  gst_username: string; //"TN_NT2.152384"
  state_cd: string; //"27"
  ip_address: string; //"223.233.73.194"
  client_id: string; //"GSTS50324a2340-d157-4275-badf-5e324vfdv3249ef"
  client_secret: string; //"GScsdc113-ff76-4dc0-sdc6c-dsdccsdcsdc20f"
  'postman-token': string; //"07028ede-06f7-4b19-b81a-48a20611e196"
  txn?: string; // Added transactionId to the response headers upon successful requests ex-> "0c67ea4c495040cfa0831991d36f1ab7"
}

// Common response interface for GST API responses
export interface GstResponse {
  status_cd: string; // "1" for success, "0" for failure
  status_desc?: string; // Description of the status ex-> "user name exists"
  error?: GSTErrorResponse;
  header?: GSTHeaderResponse;
}
