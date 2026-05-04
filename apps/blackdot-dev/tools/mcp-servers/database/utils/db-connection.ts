import postgres, { type Sql } from 'postgres';

/**
 * Get the raw postgres client for raw SQL queries
 */
export function getDatabaseClient(): Sql {
  const databaseUrl = process.env.dds_POSTGRES_URL;

  if (!databaseUrl) {
    throw new Error('dds_POSTGRES_URL environment variable is not set');
  }

  return postgres(databaseUrl, {
    ssl: true,
    max: 5,
  });
}
