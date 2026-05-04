import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from '@/drizzle/schema';

/**
 * Database client for server-side operations
 * Uses connection pooling for optimal performance on Vercel
 */
const globalForDb = global as unknown as { db?: ReturnType<typeof drizzle<typeof schema>> };

export const db: ReturnType<typeof drizzle<typeof schema>> =
  globalForDb.db ||
  drizzle(postgres(process.env.dds_POSTGRES_URL!), {
    schema,
    logger: process.env.NODE_ENV === 'development',
  });

if (process.env.NODE_ENV !== 'production') globalForDb.db = db;

export * from 'drizzle-orm';
