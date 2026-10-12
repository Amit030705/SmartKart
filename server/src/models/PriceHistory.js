import mongoose from 'mongoose';

const priceHistorySchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
    index: true,
  },
  price: {
    type: Number,
    required: true,
  },
  recordedAt: {
    type: Date,
    default: Date.now,
    index: true,
  },
  source: {
    type: String,
    default: 'catalog_audit',
  },
  sourceUrl: { type: String, trim: true },
  availability: { type: String, enum: ['in_stock', 'out_of_stock', 'unknown'], default: 'unknown' },
}, {
  timestamps: true,
});

export const PriceHistory = mongoose.model('PriceHistory', priceHistorySchema);
