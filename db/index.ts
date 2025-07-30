import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema.js';

// Database URL from environment variables
const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  console.warn('DATABASE_URL not found, using mock database connection');
}

// Create database connection
const sql = databaseUrl ? postgres(databaseUrl) : null;
export const db = sql ? drizzle(sql, { schema }) : createMockDB();

// Mock database for development without real database
function createMockDB() {
  const mockQuery = {
    files: {
      findFirst: async () => null,
      findMany: async () => [],
    }
  };

  return {
    insert: () => ({
      values: () => ({
        returning: async () => [{ id: 'mock-id', createdAt: new Date() }]
      })
    }),
    delete: () => ({
      where: () => ({ execute: async () => {} })
    }),
    query: mockQuery,
    select: () => ({
      from: () => ({
        where: () => ({
          limit: () => ({
            offset: () => []
          })
        })
      })
    }),
    // Add other necessary mock methods as needed
  } as any;
}

export * from './schema.js';
