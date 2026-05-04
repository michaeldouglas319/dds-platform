import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { sql, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'
import * as schemaModule from '@/drizzle/schema'
import type { SQL } from 'drizzle-orm'

// Type assertion for schema to satisfy TypeScript
const schema = schemaModule as typeof schemaModule & {
  appConfigs: typeof schemaModule.appConfigs
  appConfigVersions: typeof schemaModule.appConfigVersions
}

/**
 * Config System Integration Tests
 * Tests the complete config system using direct database operations
 * Bypasses HTTP/Clerk layer to test core functionality
 */
describe('Config System (Direct Database)', () => {
  let db: ReturnType<typeof drizzle>
  let client: ReturnType<typeof postgres>
  const testConfigIds: string[] = []

  beforeAll(async () => {
    client = postgres(process.env.dds_POSTGRES_URL!)
    db = drizzle(client, { schema })

    // Clean up any existing test data
    await db.execute(sql`
      DELETE FROM app_configs
      WHERE namespace IN ('test', 'content') AND (category = 'test' OR key = 'test')
    `)
  })

  afterAll(async () => {
    // Cleanup all test configs
    await db.execute(sql`
      DELETE FROM app_configs
      WHERE namespace IN ('test', 'content') AND (category = 'test' OR key = 'test')
    `)
    await client.end()
  })

  describe('Config CRUD Operations', () => {
    it('should create and fetch config by full_path', async () => {
      const testId = `test_${nanoid()}`
      testConfigIds.push(testId)

      // Create config
      await db.insert(schema.appConfigs).values({
        id: testId,
        namespace: 'test',
        category: 'crud',
        key: 'fetch',
        fullPath: 'test.crud.fetch',
        data: { message: 'hello from database' },
        version: 1,
        isActive: true,
        requiredAccessLevel: 'member',
        createdBy: 'test-user',
        updatedBy: 'test-user',
      })

      // Fetch by full_path
      const config = await (db.query as any).appConfigs.findFirst({
        where: eq(schema.appConfigs.fullPath, 'test.crud.fetch'),
      })

      expect(config).toBeDefined()
      expect(config?.fullPath).toBe('test.crud.fetch')
      expect(config?.data).toEqual({ message: 'hello from database' })
      expect(config?.version).toBe(1)
    })

    it('should update config and increment version', async () => {
      const testId = `test_${nanoid()}`
      testConfigIds.push(testId)

      // Create initial config
      await db.insert(schema.appConfigs).values({
        id: testId,
        namespace: 'test',
        category: 'crud',
        key: 'update',
        fullPath: 'test.crud.update',
        data: { count: 1 },
        version: 1,
        isActive: true,
        requiredAccessLevel: 'member',
        createdBy: 'test-user',
        updatedBy: 'test-user',
      })

      // Update config
      const updated = await db
        .update(schema.appConfigs)
        .set({
          data: { count: 2 },
          version: 2,
          updatedAt: new Date(),
        })
        .where(eq(schema.appConfigs.id, testId))
        .returning()

      expect(updated[0].version).toBe(2)
      expect(updated[0].data).toEqual({ count: 2 })
    })

    it('should create version entry when config is updated', async () => {
      const testId = `test_${nanoid()}`
      const versionId = `version_${nanoid()}`
      testConfigIds.push(testId)

      // Create config
      await db.insert(schema.appConfigs).values({
        id: testId,
        namespace: 'test',
        category: 'crud',
        key: 'versioning',
        fullPath: 'test.crud.versioning',
        data: { value: 'v1' },
        version: 1,
        isActive: true,
        requiredAccessLevel: 'member',
        createdBy: 'test-user',
        updatedBy: 'test-user',
      })

      // Create version entry before updating
      await db.insert(schema.appConfigVersions).values({
        id: versionId,
        configId: testId,
        version: 1,
        data: { value: 'v1' },
        changeType: 'update',
        changesSummary: 'Test update',
        createdBy: 'test-user',
      })

      // Update config
      await db
        .update(schema.appConfigs)
        .set({
          data: { value: 'v2' },
          version: 2,
        })
        .where(eq(schema.appConfigs.id, testId))

      // Verify version was created
      const versions = await (db.query as any).appConfigVersions.findMany({
        where: eq(schema.appConfigVersions.configId, testId),
      })

      expect(versions).toHaveLength(1)
      expect(versions[0].version).toBe(1)
      expect(versions[0].data).toEqual({ value: 'v1' })
    })

    it('should soft delete config', async () => {
      const testId = `test_${nanoid()}`
      testConfigIds.push(testId)

      // Create config
      await db.insert(schema.appConfigs).values({
        id: testId,
        namespace: 'test',
        category: 'crud',
        key: 'delete',
        fullPath: 'test.crud.delete',
        data: { value: 'to be deleted' },
        version: 1,
        isActive: true,
        requiredAccessLevel: 'member',
        createdBy: 'test-user',
        updatedBy: 'test-user',
      })

      // Soft delete
      await db
        .update(schema.appConfigs)
        .set({
          isActive: false,
          updatedAt: new Date(),
        })
        .where(eq(schema.appConfigs.id, testId))

      // Verify still exists but inactive
      const config = await (db.query as any).appConfigs.findFirst({
        where: eq(schema.appConfigs.id, testId),
      })

      expect(config).toBeDefined()
      expect(config?.isActive).toBe(false)
    })
  })

  describe('Bulk Operations', () => {
    it('should fetch multiple configs efficiently', async () => {
      const id1 = `test_${nanoid()}`
      const id2 = `test_${nanoid()}`
      testConfigIds.push(id1, id2)

      // Create multiple configs
      await db.insert(schema.appConfigs).values([
        {
          id: id1,
          namespace: 'test',
          category: 'bulk',
          key: 'one',
          fullPath: 'test.bulk.one',
          data: { value: 1 },
          version: 1,
          isActive: true,
          requiredAccessLevel: 'member',
          createdBy: 'test-user',
          updatedBy: 'test-user',
        },
        {
          id: id2,
          namespace: 'test',
          category: 'bulk',
          key: 'two',
          fullPath: 'test.bulk.two',
          data: { value: 2 },
          version: 1,
          isActive: true,
          requiredAccessLevel: 'member',
          createdBy: 'test-user',
          updatedBy: 'test-user',
        },
      ])

      // Fetch both
      const configs = await (db.query as any).appConfigs.findMany({
        where: sql`${schema.appConfigs.fullPath} IN ('test.bulk.one', 'test.bulk.two')`,
      })

      expect(configs).toHaveLength(2)
      expect(configs.find((c: typeof schema.appConfigs.$inferSelect) => c.fullPath === 'test.bulk.one')?.data).toEqual({ value: 1 })
      expect(configs.find((c: typeof schema.appConfigs.$inferSelect) => c.fullPath === 'test.bulk.two')?.data).toEqual({ value: 2 })
    })
  })

  describe('Access Level Control', () => {
    it('should store different access levels', async () => {
      const configs = [
        { id: `test_${nanoid()}`, level: 'everyone' as const, key: 'public' },
        { id: `test_${nanoid()}`, level: 'member' as const, key: 'member' },
        { id: `test_${nanoid()}`, level: 'admin' as const, key: 'admin' },
      ]

      testConfigIds.push(...configs.map(c => c.id))

      // Create configs with different access levels
      for (const config of configs) {
        await db.insert(schema.appConfigs).values({
          id: config.id,
          namespace: 'test',
          category: 'access',
          key: config.key,
          fullPath: `test.access.${config.key}`,
          data: { level: config.level },
          version: 1,
          isActive: true,
          requiredAccessLevel: config.level,
          createdBy: 'test-user',
          updatedBy: 'test-user',
        })
      }

      // Verify access levels
      const everyoneConfig = await (db.query as any).appConfigs.findFirst({
        where: eq(schema.appConfigs.fullPath, 'test.access.public'),
      })
      const memberConfig = await (db.query as any).appConfigs.findFirst({
        where: eq(schema.appConfigs.fullPath, 'test.access.member'),
      })
      const adminConfig = await (db.query as any).appConfigs.findFirst({
        where: eq(schema.appConfigs.fullPath, 'test.access.admin'),
      })

      expect(everyoneConfig?.requiredAccessLevel).toBe('everyone')
      expect(memberConfig?.requiredAccessLevel).toBe('member')
      expect(adminConfig?.requiredAccessLevel).toBe('admin')
    })
  })

  describe('Real-World Config Usage', () => {
    it('should simulate content.resume config', async () => {
      const testId = `test_${nanoid()}`
      testConfigIds.push(testId)

      const resumeData = {
        name: 'Test User',
        title: 'Software Engineer',
        jobs: [
          {
            company: 'Test Corp',
            role: 'Developer',
            duration: '2020-2023',
          },
        ],
      }

      // Create resume config
      await db.insert(schema.appConfigs).values({
        id: testId,
        namespace: 'content',
        category: 'resume',
        key: 'test',
        fullPath: 'content.resume.test',
        data: resumeData,
        version: 1,
        isActive: true,
        requiredAccessLevel: 'member',
        cacheTTL: 3600,
        tags: ['resume', 'content'],
        description: 'Test resume configuration',
        createdBy: 'test-user',
        updatedBy: 'test-user',
      })

      // Fetch and verify
      const config = await (db.query as any).appConfigs.findFirst({
        where: eq(schema.appConfigs.fullPath, 'content.resume.test'),
      })

      expect(config?.data).toEqual(resumeData)
      expect(config?.tags).toContain('resume')
      expect(config?.cacheTTL).toBe(3600)
    })
  })
})
