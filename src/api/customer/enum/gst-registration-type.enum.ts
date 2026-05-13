/**
 * Drives GSTR-1 classification (B2B / B2C / SEZ / Export) and which fields are
 * required at customer-form save time.
 */
export enum GstRegistrationType {
  REGULAR = 'REGULAR',
  COMPOSITION = 'COMPOSITION',
  UNREGISTERED = 'UNREGISTERED',
  CONSUMER = 'CONSUMER',
  SEZ_WITH_PAYMENT = 'SEZ_WITH_PAYMENT',
  SEZ_WITHOUT_PAYMENT = 'SEZ_WITHOUT_PAYMENT',
  OVERSEAS_EXPORT = 'OVERSEAS_EXPORT',
}
