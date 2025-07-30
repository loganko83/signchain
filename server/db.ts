import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as schema from "@shared/schema";

// Mock database for development without DATABASE_URL
function createMockDB() {
  const mockQuery = {
    documents: {
      findFirst: async () => null,
      findMany: async () => [],
    },
    signatures: {
      findFirst: async () => null,
      findMany: async () => [],
    },
    users: {
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

// Create database connection or use mock
const databaseUrl = process.env.DATABASE_URL;

let pool: any = null;
if (databaseUrl) {
  pool = postgres(databaseUrl);
  console.log('✅ Database connection established');
} else {
  console.warn('⚠️ DATABASE_URL not found, using mock database');
}

export const db = pool ? drizzle(pool, { schema }) : createMockDB();
export { pool };
