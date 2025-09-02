export interface GstPreference {
  preference: string;
  quarter: string;
}

export interface GstPublicPrefResponse {
  data: {
    response: GstPreference[];
  };
  status_cd: string;
  status_desc: string;
  header: {
    client_id: string;
    ip_address: string;
    client_secret: string;
    'postman-token': string;
    state_cd: string;
    via: string;
    'x-amz-cf-id': string;
    gstin: string;
  };
}
