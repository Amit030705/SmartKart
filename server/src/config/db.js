import mongoose from 'mongoose';
import dns from 'node:dns';
import { ENV } from './env.js';

let mongoMemoryServerInstance = null;

if (ENV.MONGODB_DNS_SERVERS.length) {
  dns.setServers(ENV.MONGODB_DNS_SERVERS);
}

export const connectDB = async () => {
  try {
    if (ENV.USE_MEMORY_DB === 'true') {
      return await connectMemoryDB();
    }

    console.log('[Database] Connecting to configured MongoDB...');
    try {
      const conn = await mongoose.connect(ENV.MONGODB_URI, {
        serverSelectionTimeoutMS: 10000,
      });
      console.log(`[Database] Connected to MongoDB: ${conn.connection.host}`);
      return conn;
    } catch (error) {
      // Keep zero-setup development for a missing local MongoDB, but never let
      // an Atlas/remote failure silently send app data to a temporary database.
      if (ENV.USE_MEMORY_DB === 'auto' && !ENV.MONGODB_URI_IS_REMOTE) {
        console.warn('[Database] Local MongoDB unavailable. Starting temporary in-memory MongoDB.');
        return await connectMemoryDB();
      }
      throw error;
    }
  } catch (error) {
    console.error(`[Database Error] ${error.name || 'Error'}: MongoDB connection failed. Check MONGODB_URI, credentials, and network access.`);
    process.exit(1);
  }
};

const connectMemoryDB = async () => {
  try {
    const { MongoMemoryServer } = await import('mongodb-memory-server');
    mongoMemoryServerInstance = await MongoMemoryServer.create();
    const uri = mongoMemoryServerInstance.getUri();
    const conn = await mongoose.connect(uri);
    console.log('[Database] Connected to temporary in-memory MongoDB. Data will not persist after shutdown.');
    return conn;
  } catch (error) {
    throw error;
  }
};

export const disconnectDB = async () => {
  await mongoose.disconnect();
  if (mongoMemoryServerInstance) {
    await mongoMemoryServerInstance.stop();
  }
};
