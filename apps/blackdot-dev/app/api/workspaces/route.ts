import { auth } from '@clerk/nextjs/server';
import { db } from '@/lib/db';
import { workspaces, workspaceMembers } from '@/drizzle/schema';
import { eq, inArray } from 'drizzle-orm';

/**
 * GET /api/workspaces - Get all workspaces for current user
 */
export async function GET() {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get all workspaces user is member of
    const userMemberships = await db.query.workspaceMembers.findMany({
      where: eq(workspaceMembers.userId, userId),
    });

    const workspaceIds = userMemberships.map(m => m.workspaceId);

    const userWorkspaces = await db.query.workspaces.findMany({
      where: (ws) => inArray(ws.id, workspaceIds),
      with: {
        owner: {
          columns: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return Response.json(userWorkspaces);
  } catch (error) {
    console.error('Failed to fetch workspaces:', error);
    return Response.json(
      { error: 'Failed to fetch workspaces' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/workspaces - Create a new workspace
 */
export async function POST(req: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return Response.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return Response.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      );
    }

    // Create workspace
    const workspaceId = `ws_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    await db.insert(workspaces).values({
      id: workspaceId,
      name,
      description: description || null,
      ownerId: userId,
    });

    // Add creator as owner member
    const memberId = `wsm_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    await db.insert(workspaceMembers).values({
      id: memberId,
      workspaceId,
      userId,
      role: 'owner',
    });

    const newWorkspace = await db.query.workspaces.findFirst({
      where: eq(workspaces.id, workspaceId),
      with: {
        owner: {
          columns: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            avatarUrl: true,
          },
        },
      },
    });

    return Response.json(newWorkspace, { status: 201 });
  } catch (error) {
    console.error('Failed to create workspace:', error);
    return Response.json(
      { error: 'Failed to create workspace' },
      { status: 500 }
    );
  }
}
