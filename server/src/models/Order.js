import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true,
  },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  specsSummary: { type: String, default: '' },
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  items: [orderItemSchema],
  shippingAddress: {
    street: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    postalCode: { type: String, required: true },
    country: { type: String, default: 'India' },
    phone: { type: String, required: true },
  },
  paymentMethod: {
    type: String,
    enum: ['card_simulated', 'cod', 'wallet_simulated'],
    default: 'card_simulated',
  },
  paymentResult: {
    status: { type: String, default: 'completed' },
    transactionId: { type: String },
    paidAt: { type: Date, default: Date.now },
  },
  pricing: {
    subtotal: { type: Number, required: true },
    shippingCost: { type: Number, required: true, default: 0 },
    tax: { type: Number, required: true, default: 0 },
    discount: { type: Number, default: 0 },
    total: { type: Number, required: true },
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'processing',
    index: true,
  },
  statusHistory: [{
    status: { type: String },
    changedAt: { type: Date, default: Date.now },
    note: { type: String },
  }],
}, {
  timestamps: true,
});

export const Order = mongoose.model('Order', orderSchema);
