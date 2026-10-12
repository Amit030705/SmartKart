import dotenv from 'dotenv';
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 5000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  MONGODB_URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/smartcart',
  USE_MEMORY_DB: process.env.USE_MEMORY_DB || 'auto',
  JWT_SECRET: process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'development_only_change_me'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',
  COOKIE_SECRET: process.env.COOKIE_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'development_only_change_me'),
};

if (ENV.NODE_ENV === 'production' && (!ENV.JWT_SECRET || !ENV.COOKIE_SECRET)) {
  throw new Error('JWT_SECRET and COOKIE_SECRET must be configured in production.');
}
