import fs from 'node:fs/promises';
import { connectDB, disconnectDB } from '../config/db.js';
import { Product } from '../models/Product.js';
import { PriceHistory } from '../models/PriceHistory.js';

const validUrl = (value) => {
  try { const url = new URL(value); return url.protocol === 'https:'; } catch { return false; }
};

export async function importVerifiedPrices(records) {
  const report = { inserted: 0, updated: 0, skipped: 0, failed: 0, errors: [] };
  if (!Array.isArray(records)) throw new TypeError('Input must be a JSON array.');
  for (const [index, row] of records.entries()) {
    try {
      if (!row || typeof row.brand !== 'string' || typeof row.model !== 'string' || typeof row.configuration !== 'string' || !Number.isFinite(row.price) || row.price <= 0 || typeof row.source !== 'string' || !validUrl(row.sourceUrl) || !row.verifiedAt || Number.isNaN(Date.parse(row.verifiedAt))) {
        throw new Error('Required fields: brand, model, configuration, positive price, source, HTTPS sourceUrl and valid verifiedAt.');
      }
      const matches = await Product.find({ brand: row.brand, model: row.model, configuration: row.configuration });
      if (matches.length !== 1) {
        report.skipped += 1;
        report.errors.push({ index, reason: matches.length ? 'Ambiguous exact model/configuration match' : 'No exact catalog model/configuration match' });
        continue;
      }
      const product = matches[0];
      const observedAt = new Date(row.verifiedAt);
      if (row.mrp !== undefined && (!Number.isFinite(row.mrp) || row.mrp < row.price)) throw new Error('MRP must be numeric and at least the observed price.');
      const changed = product.observedPrice !== row.price || product.priceSource !== row.source || product.priceUrl !== row.sourceUrl || (row.mrp !== undefined && product.mrp !== row.mrp);
      product.observedPrice = row.price;
      product.priceSource = row.source;
      product.priceUrl = row.sourceUrl;
      product.priceVerifiedAt = observedAt;
      product.availability = ['in_stock', 'out_of_stock'].includes(row.availability) ? row.availability : 'unknown';
      if (row.mrp !== undefined) product.mrp = row.mrp;
      product.currency = 'INR';
      await product.save();
      const historyExists = await PriceHistory.exists({ product: product._id, price: row.price, source: row.source, recordedAt: observedAt });
      if (!historyExists) await PriceHistory.create({ product: product._id, price: row.price, source: row.source, sourceUrl: row.sourceUrl, availability: product.availability, recordedAt: observedAt });
      report.updated += Number(changed);
      report.inserted += Number(!changed);
    } catch (error) {
      report.failed += 1;
      report.errors.push({ index, reason: error.message });
    }
  }
  return report;
}

if (process.argv[1]?.endsWith('importVerifiedPrices.js')) {
  const file = process.argv[2];
  if (!file) { console.error('Usage: npm run import:prices -- path/to/verified-prices.json'); process.exit(2); }
  try {
    const records = JSON.parse(await fs.readFile(file, 'utf8'));
    await connectDB();
    console.log(JSON.stringify(await importVerifiedPrices(records), null, 2));
  } catch (error) {
    console.error(`[Price Import Error] ${error.message}`);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
}
