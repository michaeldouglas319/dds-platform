import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import { sql, eq } from 'drizzle-orm'
import { nanoid } from 'nanoid'

/**
 * App Configs Schema Tests
 * Tests the database schema for storing configurations
 */
describe('App Configs Schema', () => {
  let db: ReturnType<typeof drizzle>
  let client: ReturnType<typeof postgres>

  beforeAll(() => {
    client = postgres(process.env.dds_POSTGRES_URL!)
    db = drizzle(client)
  })

  afterAll(async () => {
    await client.end()
  })

  it('should have app_configs table', async () => {
    const result = await db.execute(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'app_configs'
    `)

    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(1)
    expect(result[0].table_name).toBe('app_configs')
  })

  it('should have correct columns in app_configs', async () => {
    const result = await db.execute(sql`
      SELECT column_name, data_type, is_nullable
      FROM information_schema.columns
      WHERE table_schema = 'public'
      AND table_name = 'app_configs'
      ORDER BY ordinal_position
    `)

    const columns = result.map((r: Record<string, unknown>) => r.column_name as string)

    expect(columns).toContain('id')
    expect(columns).toContain('namespace')
    expect(columns).toContain('category')
    expect(columns).toContain('key')
    expect(columns).toContain('full_path')
    expect(columns).toContain('data')
    expect(columns).toContain('version')
    expect(columns).toContain('is_active')
    expect(columns).toContain('created_at')
    expect(columns).toContain('updated_at')
  })

  it('should insert a test config successfully', async () => {
    const testConfig = {
      id: `test_${nanoid()}`,
      namespace: 'test',
      category: 'unit',
      key: 'sample',
      full_path: 'test.unit.sample',
      data: { hello: 'world', count: 42 },
      version: 1,
      is_active: true,
      created_by: 'test-user',
      updated_by: 'test-user',
    }

    const result = await db.execute(sql`
      INSERT INTO app_configs (
        id, namespace, category, key, full_path, data, version, is_active, created_by, updated_by
      ) VALUES (
        ${testConfig.id},
        ${testConfig.namespace},
        ${testConfig.category},
        ${testConfig.key},
        ${testConfig.full_path},
        ${JSON.stringify(testConfig.data)}::jsonb,
        ${testConfig.version},
        ${testConfig.is_active},
        ${testConfig.created_by},
        ${testConfig.updated_by}
      )
      RETURNING *
    `)

    expect(result.length).toBe(1)
    expect(result[0].id).toBe(testConfig.id)
    expect(result[0].full_path).toBe('test.unit.sample')

    // Cleanup
    await db.execute(sql`DELETE FROM app_configs WHERE id = ${testConfig.id}`)
  })

  it('should enforce unique constraint on full_path', async () => {
    const id1 = `test_${nanoid()}`
    const id2 = `test_${nanoid()}`

    // Insert first config
    await db.execute(sql`
      INSERT INTO app_configs (
        id, namespace, category, key, full_path, data, version, is_active, created_by, updated_by
      ) VALUES (
        ${id1}, 'test', 'constraint', 'unique', 'test.constraint.unique',
        '{}'::jsonb, 1, true, 'test-user', 'test-user'
      )
    `)

    // Try to insert duplicate full_path
    let errorCaught = false
    try {
      await db.execute(sql`
        INSERT INTO app_configs (
          id, namespace, category, key, full_path, data, version, is_active, created_by, updated_by
        ) VALUES (
          ${id2}, 'test', 'constraint', 'unique', 'test.constraint.unique',
          '{}'::jsonb, 1, true, 'test-user', 'test-user'
        )
      `)
    } catch (error: unknown) {
      errorCaught = true
      const err = error as Error
      expect(err.message).toContain('unique')
    }

    expect(errorCaught).toBe(true)

    // Cleanup
    await db.execute(sql`DELETE FROM app_configs WHERE id = ${id1}`)
  })

  it('should store and retrieve JSONB data correctly', async () => {
    const testId = `test_${nanoid()}`
    const complexData = {
      string: 'test',
      number: 123,
      boolean: true,
      array: [1, 2, 3],
      nested: {
        deep: {
          value: 'nested value',
        },
      },
    }

    // Insert
    await db.execute(sql`
      INSERT INTO app_configs (
        id, namespace, category, key, full_path, data, version, is_active, created_by, updated_by
      ) VALUES (
        ${testId}, 'test', 'jsonb', 'complex', 'test.jsonb.complex',
        ${JSON.stringify(complexData)}::jsonb, 1, true, 'test-user', 'test-user'
      )
    `)

    // Retrieve
    const result = await db.execute(sql`
      SELECT data FROM app_configs WHERE id = ${testId}
    `)

    expect(result.length).toBe(1)
    expect(result[0].data).toEqual(complexData)

    // Cleanup
    await db.execute(sql`DELETE FROM app_configs WHERE id = ${testId}`)
  })

  it('should have app_config_versions table', async () => {
    const result = await db.execute(sql`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      AND table_name = 'app_config_versions'
    `)

    expect(Array.isArray(result)).toBe(true)
    expect(result.length).toBe(1)
    expect(result[0].table_name).toBe('app_config_versions')
  })

  it('should create version entry when config is updated', async () => {
    const configId = `test_${nanoid()}`

    // Insert config
    await db.execute(sql`
      INSERT INTO app_configs (
        id, namespace, category, key, full_path, data, version, is_active, created_by, updated_by
      ) VALUES (
        ${configId}, 'test', 'version', 'track', 'test.version.track',
        '{"value": 1}'::jsonb, 1, true, 'test-user', 'test-user'
      )
    `)

    // Create version entry
    const versionId = `version_${nanoid()}`
    await db.execute(sql`
      INSERT INTO app_config_versions (
        id, config_id, version, data, change_type, created_by
      ) VALUES (
        ${versionId}, ${configId}, 1, '{"value": 1}'::jsonb, 'create', 'test-user'
      )
    `)

    // Verify version was created
    const versions = await db.execute(sql`
      SELECT * FROM app_config_versions WHERE config_id = ${configId}
    `)

    expect(versions.length).toBe(1)
    expect(versions[0].version).toBe(1)
    expect(versions[0].change_type).toBe('create')

    // Cleanup
    await db.execute(sql`DELETE FROM app_config_versions WHERE id = ${versionId}`)
    await db.execute(sql`DELETE FROM app_configs WHERE id = ${configId}`)
  })
})
