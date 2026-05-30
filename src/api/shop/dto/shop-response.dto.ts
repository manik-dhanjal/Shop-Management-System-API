export class GstDetailsSummaryDto {
  gstin: string;
  legalName?: string;
  tradeName?: string;
  panCardNumber?: string;
  address?: string;
  state?: string;
  registrationDate?: string;
  status?: string;
  constitutionOfBusiness?: string;
  einvoiceApplicable?: boolean;
  natureOfBusiness?: string[];
  verifiedAt?: string;
  username?: string;
  email?: string;
  // gstSessionToken and gstSessionExpiresAt intentionally omitted
}

export class ShopResponseDto {
  _id: string;
  name: string;
  kind: string;
  status: string;
  description?: string;
  logo?: any;
  currency: string;
  timezone: string;
  billingEmail?: string;
  location?: any;
  gstDetails?: GstDetailsSummaryDto;
  phone?: string;
  email?: string;
  alternatePhones: string[];
  alternateEmails: string[];
  contactPersonName?: string;
  contactPersonDesignation?: string;
  contactPersons: any[];
  myRoles?: string[];
  createdAt: string;
  updatedAt: string;
  // suppliers, isDeleted, deletedAt, __v intentionally omitted
}

export function toShopResponse(doc: any, myRoles?: string[]): ShopResponseDto {
  const { suppliers, isDeleted, deletedAt, __v, ...rest } = doc;
  if (rest.gstDetails) {
    const { gstSessionToken, gstSessionExpiresAt, ...gst } = rest.gstDetails;
    rest.gstDetails = gst;
  }
  return { ...rest, myRoles: myRoles ?? rest.myRoles };
}
