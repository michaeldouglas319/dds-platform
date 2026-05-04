import { describe, it, expect, beforeAll } from 'vitest'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { sql } from 'drizzle-orm'

/**
 * Database Connection Tests
 * Validates connectivity to Supabase PostgreSQL
 */
describe('Database Connection', () => {
  let db: ReturnType<typeof drizzle>
  let client: ReturnType<typeof postgres>

  beforeAll(() => {
    // Create fresh connection for tests
    client = postgres(process.env.dds_POSTGRES_URL!)
    db = drizzle(client)
  })

  it('should connect to database', async () => {
    const result = await db.execute(sql`SELECT 1 as test`)
    console.log('Result:', result)
    expect(result).toBeDefined()
    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
    expect(result[0]).toHaveProperty('test', 1)
  })

  it('should list database tables', async () => {
    const result = await db.execute(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)

    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBeGreaterThan(0)
    console.log(`Found ${result.length} tables`)
  })

  it('should have required environment variables', () => {
    expect(process.env.dds_POSTGRES_URL).toBeDefined()
    expect(process.env.dds_POSTGRES_URL).toContain('supabase.co')
  })
})
