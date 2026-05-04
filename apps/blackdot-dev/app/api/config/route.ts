import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { appConfigs } from '@/drizzle/schema'
import { inArray } from 'drizzle-orm'

/**
 * GET /api/config?keys=key1,key2,key3
 * Bulk fetch multiple configs
 *
 * @example GET /api/config?keys=content.resume,models.shared,design.tokens
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const keysParam = searchParams.get('keys')

    if (!keysParam) {
      return NextResponse.json(
        { error: 'Missing keys parameter', code: 'INVALID_REQUEST' },
        { status: 400 }
      )
    }

    const keys = keysParam.split(',')

    // Enforce max 10 keys limit
    if (keys.length > 10) {
      return NextResponse.json(
        { error: 'Maximum 10 keys allowed', code: 'TOO_MANY_KEYS' },
        { status: 400 }
      )
    }

    // Fetch all configs in one query
    const configs = await db.query.appConfigs.findMany({
      where: inArray(appConfigs.fullPath, keys),
    })

    // Convert to key-value map
    const configMap: Record<string, any> = {}
    const metadata: Record<string, any> = {}
    const errors: Record<string, string> = {}

    for (const key of keys) {
      const config = configs.find((c) => c.fullPath === key)

      if (config) {
        configMap[key] = config.data
        metadata[key] = {
          version: config.version,
          lastUpdated: config.updatedAt.toISOString(),
          source: 'database',
        }
      } else {
        errors[key] = 'Not found'
      }
    }

    return NextResponse.json({
      configs: configMap,
      metadata,
      errors: Object.keys(errors).length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error('Bulk config fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch configs', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }
}
