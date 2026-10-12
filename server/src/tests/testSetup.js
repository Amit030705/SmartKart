// Test suite must never connect to any configured developer or production database.
process.env.NODE_ENV = 'test';
process.env.USE_MEMORY_DB = 'true';
