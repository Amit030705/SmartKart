import { connectDB, disconnectDB } from '../config/db.js';
import { User } from '../models/User.js';
import { Product } from '../models/Product.js';
import mongoose from 'mongoose';
import { seedUsers, seedProducts } from './seedData.js';

// Safe, additive and idempotent: preserves orders, carts, reviews, wishlists and existing catalog records.
export const seedDatabase = async () => {
  if (mongoose.connection.readyState === 0) await connectDB();
  let usersCreated = 0;
  let productsCreated = 0;
  for (const user of seedUsers) {
    if (!await User.exists({ email: user.email })) {
      await User.create(user);
      usersCreated += 1;
    }
  }
  for (const product of seedProducts) {
    if (!await Product.exists({ slug: product.slug })) {
      await Product.create({ ...product, currency: 'INR' });
      productsCreated += 1;
    }
  }
  console.log(`[Seeder] Added ${usersCreated} demo users and ${productsCreated} products. Existing data preserved.`);
  console.log('[Seeder] Catalog prices are unverified examples; no synthetic price history, reviews, or orders are created.');
  return { success: true, usersCreated, productsCreated };
};

if (process.argv[1]?.endsWith('seed.js')) {
  seedDatabase()
    .then(() => disconnectDB().then(() => process.exit(0)))
    .catch((error) => {
      console.error(`[Seeder Error] ${error.message}`, error);
      process.exit(1);
    });
}
