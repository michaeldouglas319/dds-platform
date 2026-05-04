import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { appConfigs, appConfigVersions } from '@/drizzle/schema'
import { eq, sql } from 'drizzle-orm'
import { auth } from '@clerk/nextjs/server'
import { nanoid } from 'nanoid'

/**
 * GET /api/config/[key]
 * Fetch a single config by full_path key
 *
 * @example GET /api/config/content.resume.jobs
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { key } = await params

    // Decode the key (in case it has URL encoding)
    const decodedKey = decodeURIComponent(key)

    // Fetch config from database
    const config = await db.query.appConfigs.findFirst({
      where: eq(appConfigs.fullPath, decodedKey),
    })

    if (!config) {
      return NextResponse.json(
        { error: 'Config not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    // Check access level - for now, allow member+ to read
    // Admin-level configs require authentication
    if (config.requiredAccessLevel === 'admin') {
      const { userId } = await auth()
      if (!userId) {
        return NextResponse.json(
          { error: 'Unauthorized', code: 'UNAUTHORIZED' },
          { status: 401 }
        )
      }
    }
    // Member-level configs are readable by authenticated users
    // Everyone-level configs are public

    // Return config with metadata
    return NextResponse.json(
      {
        key: config.fullPath,
        value: config.data,
        metadata: {
          version: config.version,
          lastUpdated: config.updatedAt.toISOString(),
          source: 'database',
          namespace: config.namespace,
          category: config.category,
          tags: config.tags,
        },
      },
      {
        headers: {
          'Cache-Control': `public, max-age=${config.cacheTTL || 300}, stale-while-revalidate=60`,
        },
      }
    )
  } catch (error) {
    console.error('Config fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch config', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * PATCH /api/config/[key]
 * Update a config (admin only)
 *
 * @example PATCH /api/config/content.resume.jobs
 * Body: { value: {...}, changeDescription: "Updated resume data" }
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { userId } = await auth()

    // Check admin access
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    // TODO: Check if user is actually admin
    // const user = await getUserFromDatabase(userId)
    // if (user.accessLevel !== 'admin') { ... }

    const { key } = await params
    const decodedKey = decodeURIComponent(key)
    const body = await request.json()
    const { value, changeDescription } = body

    if (!value) {
      return NextResponse.json(
        { error: 'Missing value in request body', code: 'INVALID_REQUEST' },
        { status: 400 }
      )
    }

    // Fetch existing config
    const existing = await db.query.appConfigs.findFirst({
      where: eq(appConfigs.fullPath, decodedKey),
    })

    if (!existing) {
      return NextResponse.json(
        { error: 'Config not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    // Create version entry before updating
    await db.insert(appConfigVersions).values({
      id: `version_${nanoid()}`,
      configId: existing.id,
      version: existing.version,
      data: existing.data,
      changeType: 'update',
      changesSummary: changeDescription || 'Config updated via API',
      createdBy: userId,
    })

    // Update config
    const updated = await db
      .update(appConfigs)
      .set({
        data: value,
        version: existing.version + 1,
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(eq(appConfigs.id, existing.id))
      .returning()

    return NextResponse.json({
      success: true,
      config: {
        key: updated[0].fullPath,
        value: updated[0].data,
        version: updated[0].version,
      },
    })
  } catch (error) {
    console.error('Config update error:', error)
    return NextResponse.json(
      { error: 'Failed to update config', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/config/[key]
 * Soft delete a config (set is_active = false)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ key: string }> }
) {
  try {
    const { userId } = await auth()

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const { key } = await params
    const decodedKey = decodeURIComponent(key)

    // Soft delete by setting is_active to false
    const result = await db
      .update(appConfigs)
      .set({
        isActive: false,
        updatedBy: userId,
        updatedAt: new Date(),
      })
      .where(eq(appConfigs.fullPath, decodedKey))
      .returning()

    if (result.length === 0) {
      return NextResponse.json(
        { error: 'Config not found', code: 'NOT_FOUND' },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Config delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete config', code: 'SERVER_ERROR' },
      { status: 500 }
    )
  }
}
