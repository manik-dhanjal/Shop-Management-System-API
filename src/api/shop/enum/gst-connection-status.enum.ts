/**
 * Lifecycle of a shop's WhiteBooks GST session.
 *
 * PENDING   — GST identity captured but never OTP-connected (no live authtoken).
 * CONNECTED — a valid authtoken (`txn`) is held and being auto-refreshed.
 * EXPIRED   — a refresh failed; the owner must re-connect via OTP from the login page.
 */
export enum GstConnectionStatus {
  PENDING = 'PENDING',
  CONNECTED = 'CONNECTED',
  EXPIRED = 'EXPIRED',
}
