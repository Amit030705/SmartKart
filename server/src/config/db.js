import mongoose from 'mongoose';
import { ENV } from './env.js';

let mongoMemoryServerInstance = null;

export const connectDB = async () => {
  try {
    // If not forcing memory DB, try connecting to configured MONGODB_URI
    if (ENV.USE_MEMORY_DB !== 'true') {
      try {
        console.log('[Database] Connecting to configured MongoDB...');
        const conn = await mongoose.connect(ENV.MONGODB_URI, {
          serverSelectionTimeoutMS: 2500,
        });
        console.log(`[Database] Connected to MongoDB: ${conn.connection.host}`);
        return conn;
      } catch (err) {
        if (ENV.USE_MEMORY_DB === 'false') {
          throw err;
        }
        console.warn('[Database] Configured MongoDB unavailable. Falling back to embedded in-memory MongoDB.');
      }
    }

    // Embedded in-memory MongoDB fallback
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoMemoryServerInstance = await MongoMemoryServer.create();
    const uri = mongoMemoryServerInstance.getUri();
    const conn = await mongoose.connect(uri);
    console.log(`[Database] Connected to embedded in-memory MongoDB instance at ${uri}`);
    return conn;
  } catch (error) {
    console.error(`[Database Error] Failed to connect: ${error.message}`);
    process.exit(1);
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServerInstance) {
    await mongoMemoryServerInstance.stop();
  }
};
