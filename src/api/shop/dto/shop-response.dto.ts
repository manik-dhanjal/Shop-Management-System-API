export class GstDetailsSummaryDto {
  gstin: string;
  legalName?: string;
  panCardNumber?: string;
  state?: string;
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
  doc = typeof doc?.toJSON === 'function' ? doc.toJSON() : doc;

  const { suppliers, isDeleted, deletedAt, __v, ...rest } = doc;
  return { ...rest, myRoles: myRoles ?? rest.myRoles };
}
