import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const shippingAddressSchema = new mongoose.Schema({
  street: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  postalCode: { type: String, required: true },
  country: { type: String, default: 'USA' },
  phone: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
}, { _id: true });

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: 6,
  },
  role: {
    type: String,
    enum: ['user', 'admin'],
    default: 'user',
  },
  avatar: {
    type: String,
    default: '',
  },
  shippingAddresses: [shippingAddressSchema],
  savedPreferences: {
    category: { type: String, default: '' },
    budgetMin: { type: Number, default: 0 },
    budgetMax: { type: Number, default: 200000 },
    useCase: { type: String, default: 'Everyday' },
    brands: [{ type: String }],
    priorities: {
      performance: { type: Number, default: 3 },
      battery: { type: Number, default: 3 },
      camera: { type: Number, default: 3 },
      display: { type: Number, default: 3 },
      portability: { type: Number, default: 3 },
      storage: { type: Number, default: 3 },
      price: { type: Number, default: 3 },
      reliability: { type: Number, default: 3 },
    }
  }
}, {
  timestamps: true,
  toJSON: {
    transform(doc, ret) {
      delete ret.password;
      return ret;
    }
  }
});

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

export const User = mongoose.model('User', userSchema);
