/**
 * Classifies a Shop document.
 *
 * - SELF_OPERATED: a tenant shop — has users, transacts, owns inventory.
 * - EXTERNAL_SUPPLIER: a lightweight Shop created by a tenant to represent
 *   an outside supplier (manufacturer, wholesaler, etc.). It carries
 *   contact/GST/address but is not itself a tenant — no users attach to it.
 */
export enum ShopKind {
  SELF_OPERATED = 'SELF_OPERATED',
  EXTERNAL_SUPPLIER = 'EXTERNAL_SUPPLIER',
}
