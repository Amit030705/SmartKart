import mongoose from 'mongoose';

const priceWatchSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  targetPrice: {
    type: Number,
    required: true,
  },
  alertActive: {
    type: Boolean,
    default: true,
  },
  createdPrice: {
    type: Number,
    required: true,
  },
}, { _id: true, timestamps: true });

const wishlistSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
  }],
  priceWatch: [priceWatchSchema],
}, {
  timestamps: true,
});

export const Wishlist = mongoose.model('Wishlist', wishlistSchema);
