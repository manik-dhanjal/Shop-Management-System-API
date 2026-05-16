/**
 * One-off migration: convert legacy `Shop.suppliers: ObjectId[]` entries into
 * the new typed subdoc `Shop.suppliers: SupplierLink[]`.
 *
 * Safe to re-run — entries that already look like subdocs are skipped.
 *
 * Run from the backend package root:
 *
 *   MONGO_URI=... DB=... npx ts-node -r tsconfig-paths/register \
 *     src/scripts/migrate-suppliers.ts
 */
import mongoose from 'mongoose';

const MONGO_URI = process.env.MONGO_URI ?? 'mongodb://localhost:27017';
const DB = process.env.DB ?? 'sms';

async function main() {
  await mongoose.connect(MONGO_URI, { dbName: DB });
  const shops = mongoose.connection.collection('shops');

  const cursor = shops.find({ suppliers: { $exists: true, $ne: [] } });
  let touched = 0;
  let scanned = 0;

  for await (const doc of cursor) {
    scanned++;
    const next: any[] = [];
    let dirty = false;
    for (const entry of doc.suppliers as any[]) {
      // Already a subdoc? Keep as-is.
      if (entry && typeof entry === 'object' && entry.supplierShop) {
        next.push(entry);
        continue;
      }
      // Legacy: a bare ObjectId (or hex string) — wrap in a minimal subdoc.
      const supplierShop =
        entry instanceof mongoose.Types.ObjectId
          ? entry
          : new mongoose.Types.ObjectId(String(entry));
      next.push({
        _id: new mongoose.Types.ObjectId(),
        supplierShop,
        status: 'ACTIVE',
        paymentTerms: 'IMMEDIATE',
        creditLimit: 0,
        creditPeriodDays: 0,
        openingBalance: 0,
        defaultDiscountPct: 0,
        tags: [],
        stats: {
          totalOrders: 0,
          totalPurchased: 0,
          totalPaid: 0,
          outstandingPayable: 0,
          avgOrderValue: 0,
        },
        isDeleted: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      dirty = true;
    }
    if (dirty) {
      await shops.updateOne({ _id: doc._id }, { $set: { suppliers: next } });
      touched++;
    }
  }

  console.log(`scanned ${scanned} shops, migrated ${touched}.`);
  await mongoose.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
