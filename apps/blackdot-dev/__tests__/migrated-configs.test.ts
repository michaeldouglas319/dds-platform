import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { eq } from 'drizzle-orm'
import * as schemaModule from '@/drizzle/schema'

// Type assertion for schema to satisfy TypeScript
const schema = schemaModule as typeof schemaModule & {
  appConfigs: typeof schemaModule.appConfigs
  appConfigVersions: typeof schemaModule.appConfigVersions
}

/**
 * Migrated Configs Verification Tests
 * Ensures all migrated configs have proper structure and data
 */
describe('Migrated Configs', () => {
  let db: ReturnType<typeof drizzle>
  let client: ReturnType<typeof postgres>

  beforeAll(() => {
    client = postgres(process.env.dds_POSTGRES_URL!)
    db = drizzle(client, { schema })
  })

  afterAll(async () => {
    await client.end()
  })

  describe('content.resume', () => {
    it('should have valid UUID', async () => {
      const config = await (db.query as any).appConfigs.findFirst({
        where: eq(schema.appConfigs.fullPath, 'content.resume'),
      })

      expect(config).toBeDefined()
      expect(config?.id).toMatch(/^config_[a-zA-Z0-9_-]+$/)
    })

    it('should have version 1 and be active', async () => {
      const config = await (db.query as any).appConfigs.findFirst({
        where: eq(schema.appConfigs.fullPath, 'content.resume'),
      })

      expect(config?.version).toBe(1)
      expect(config?.isActive).toBe(true)
    })

    it('should have proper metadata', async () => {
      const config = await (db.query as any).appConfigs.findFirst({
        where: eq(schema.appConfigs.fullPath, 'content.resume'),
      })

      expect(config?.namespace).toBe('content')
      expect(config?.category).toBe('resume')
      expect(config?.key).toBe('jobs')
      expect(config?.requiredAccessLevel).toBe('member')
      expect(config?.cacheTTL).toBe(3600)
      expect(config?.tags).toContain('resume')
      expect(config?.tags).toContain('content')
    })

    it('should have job data array', async () => {
      const config = await (db.query as any).appConfigs.findFirst({
        where: eq(schema.appConfigs.fullPath, 'content.resume'),
      })

      expect(Array.isArray(config?.data)).toBe(true)
      expect((config?.data as unknown[]).length).toBeGreaterThan(0)

      // Verify job structure
      const firstJob = (config?.data as unknown[])[0]
      expect(firstJob).toHaveProperty('id')
      expect(firstJob).toHaveProperty('company')
      expect(firstJob).toHaveProperty('role')
      expect(firstJob).toHaveProperty('period')
      expect(firstJob).toHaveProperty('content')
    })
  })

  describe('content.business', () => {
    it('should have valid UUID and be active', async () => {
      const config = await (db.query as any).appConfigs.findFirst({
        where: eq(schema.appConfigs.fullPath, 'content.business'),
      })

      expect(config).toBeDefined()
      expect(config?.id).toMatch(/^config_[a-zA-Z0-9_-]+$/)
      expect(config?.version).toBe(1)
      expect(config?.isActive).toBe(true)
    })

    it('should have business sections data', async () => {
      const config = await (db.query as any).appConfigs.findFirst({
        where: eq(schema.appConfigs.fullPath, 'content.business'),
      })

      expect(Array.isArray(config?.data)).toBe(true)
      expect((config?.data as unknown[]).length).toBeGreaterThan(30)
    })

    it('should have proper tags', async () => {
      const config = await (db.query as any).appConfigs.findFirst({
        where: eq(schema.appConfigs.fullPath, 'content.business'),
      })

      expect(config?.tags).toContain('business')
      expect(config?.tags).toContain('content')
      expect(config?.tags).toContain('sections')
    })
  })

  describe('content.ideas', () => {
    it('should have valid UUID and be active', async () => {
      const config = await (db.query as any).appConfigs.findFirst({
        where: eq(schema.appConfigs.fullPath, 'content.ideas'),
      })

      expect(config).toBeDefined()
      expect(config?.id).toMatch(/^config_[a-zA-Z0-9_-]+$/)
      expect(config?.version).toBe(1)
      expect(config?.isActive).toBe(true)
    })

    it('should have ideas sections data', async () => {
      const config = await (db.query as any).appConfigs.findFirst({
        where: eq(schema.appConfigs.fullPath, 'content.ideas'),
      })

      expect(Array.isArray(config?.data)).toBe(true)
      expect((config?.data as unknown[]).length).toBeGreaterThan(10)
    })

    it('should have proper metadata', async () => {
      const config = await (db.query as any).appConfigs.findFirst({
        where: eq(schema.appConfigs.fullPath, 'content.ideas'),
      })

      expect(config?.namespace).toBe('content')
      expect(config?.category).toBe('ideas')
      expect(config?.requiredAccessLevel).toBe('member')
      expect(config?.tags).toContain('ideas')
    })
  })

  describe('All Migrated Configs', () => {
    it('should have timestamps', async () => {
      const configs = await (db.query as any).appConfigs.findMany({
        where: eq(schema.appConfigs.namespace, 'content'),
      })

      // Filter to only migrated configs (not test configs)
      const migratedConfigs = configs.filter((c: typeof schema.appConfigs.$inferSelect) =>
        ['content.resume', 'content.business', 'content.ideas'].includes(c.fullPath)
      )

      migratedConfigs.forEach((config: typeof schema.appConfigs.$inferSelect) => {
        expect(config.createdAt).toBeInstanceOf(Date)
        expect(config.updatedAt).toBeInstanceOf(Date)
        expect(config.createdBy).toBe('system')
        expect(config.updatedBy).toBe('system')
      })
    })

    it('should have unique UUIDs', async () => {
      const configs = await (db.query as any).appConfigs.findMany({
        where: eq(schema.appConfigs.namespace, 'content'),
      })

      const ids = configs.map((c: typeof schema.appConfigs.$inferSelect) => c.id)
      const uniqueIds = new Set(ids)

      expect(ids.length).toBe(uniqueIds.size)
    })

    it('should have unique full_paths', async () => {
      const configs = await (db.query as any).appConfigs.findMany({
        where: eq(schema.appConfigs.namespace, 'content'),
      })

      const paths = configs.map((c: typeof schema.appConfigs.$inferSelect) => c.fullPath)
      const uniquePaths = new Set(paths)

      expect(paths.length).toBe(uniquePaths.size)
    })
  })
})
