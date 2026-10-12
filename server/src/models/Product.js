import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  brand: {
    type: String,
    required: [true, 'Brand is required'],
    trim: true,
    index: true,
  },
  category: {
    type: String,
    required: [true, 'Category is required'],
    enum: ['smartphones', 'laptops', 'headphones', 'smartwatches', 'monitors', 'tablets'],
    lowercase: true,
    index: true,
  },
  subcategory: {
    type: String,
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  price: {
    type: Number,
    required: [true, 'Price is required'],
    min: [0, 'Price must be positive'],
    index: true,
  },
  originalPrice: {
    type: Number,
    min: [0, 'Original price must be positive'],
  },
  currency: { type: String, enum: ['INR'], default: 'INR' },
  mrp: { type: Number, min: 0 },
  model: { type: String, trim: true },
  configuration: { type: String, trim: true },
  observedPrice: { type: Number, min: 0 },
  priceSource: { type: String, trim: true },
  priceUrl: { type: String, trim: true },
  priceVerifiedAt: { type: Date },
  availability: { type: String, enum: ['in_stock', 'out_of_stock', 'unknown'], default: 'unknown' },
  images: [{
    type: String,
    required: true,
  }],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5,
    index: true,
  },
  reviewCount: {
    type: Number,
    default: 0,
    min: 0,
  },
  stock: {
    type: Number,
    required: [true, 'Stock quantity is required'],
    min: 0,
    default: 10,
  },
  seller: {
    name: { type: String, default: 'SmartCart Catalog' },
    rating: { type: Number, default: 0 },
    isAuthorized: { type: Boolean, default: false },
  },
  warranty: {
    type: String,
    default: '1 Year Manufacturer Warranty',
  },
  // Category-specific specifications structure
  specs: {
    // Common / Computer / Phone specs
    processor: { type: String },
    ram: { type: Number }, // in GB
    storage: { type: Number }, // in GB
    storageType: { type: String }, // SSD, NVMe, UFS, eMMC
    gpu: { type: String },
    displaySize: { type: Number }, // in inches
    displayType: { type: String }, // AMOLED, OLED, IPS, Retina, etc.
    resolution: { type: String }, // 4K, QHD, FHD, 2.5K
    refreshRate: { type: Number }, // in Hz (60, 90, 120, 144, 240)
    battery: { type: Number }, // in mAh or hours
    batteryLife: { type: Number }, // in hours or days
    os: { type: String }, // iOS, Android, macOS, Windows 11, etc.
    is5G: { type: Boolean },
    cameraMain: { type: Number }, // in MP
    weight: { type: Number }, // in kg or grams
    
    // Headphones specs
    headphoneType: { type: String }, // Over-Ear, In-Ear, On-Ear
    connectivity: { type: String }, // Wireless, Bluetooth 5.3, Wired
    anc: { type: Boolean }, // Active Noise Cancellation
    micQuality: { type: Number }, // 1-10 rating
    
    // Smartwatch specs
    hasGps: { type: Boolean },
    waterResistance: { type: String }, // 50m, IP68, 5ATM
    healthSensors: [{ type: String }], // Heart Rate, ECG, SpO2, Sleep
    
    // Monitor specs
    responseTimeMs: { type: Number },
    hasHdr: { type: Boolean },
    panelType: { type: String }, // IPS, OLED, VA
  },
  isFeatured: {
    type: Boolean,
    default: false,
  },
  isTrending: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

productSchema.index({ name: 'text', brand: 'text', description: 'text' });
productSchema.index({ category: 1, price: 1, rating: -1 });

export const Product = mongoose.model('Product', productSchema);
